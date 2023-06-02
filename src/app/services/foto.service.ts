import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { rejects } from 'assert';
import { resolve } from 'dns';
import { Foto } from '../models/Foto.interface';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  //cria a lista de fotos que vão estar armazenadas no dispositivo
  fotos: Foto[] = []
  //cria a variável que armazena o local físico(pasta) de armazenamento das fotos
  private FOTO_ARMAZENAMENTO: string = 'fotos';
  constructor(private platform: Platform) { }
  public async carregarFotosSalvas() {
    // Recuperar as fotos em cachê
    const listaFotos = await Preferences.get({ key: this.FOTO_ARMAZENAMENTO });
    this.fotos = JSON.parse(listaFotos.value as string) || [];

    // Se não estiver rodando no navegador...
    if (!this.platform.is('hybrid')) {
      // Exibir a foto lendo-a no formato base64
      for (let foto of this.fotos) {
        // Ler os dados de cada foto salva no sistema de serviços
        const readFile = await Filesystem.readFile({
          path: foto.filepath,
          directory: Directory.Data,
        });

        // Somente na plataforma da Web: Carregar a foto como dados base64
        foto.webviewPath = `data:image/jpeg;base64, ${readFile.data}`;
      }
    }
  }

  //função para tirar / buscar novas fotos
  public async tirarFoto() {
    //chama a função de câmera e armazena o arquivo na constante
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.Uri, //Dados baseados em arquivos / oferece melhor desempenho
      source: CameraSource.Camera, //tire automaticamente uma nova foto com a camera
      quality: 100 //qualidade de imagem tirada, vai de 0 a 100
    });

    const salvarArquivoFoto = await this.salvarFoto(fotoCapturada);

    // Adicionar a nova foto à matriz fotos
    this.fotos.unshift(salvarArquivoFoto);

    // Armazenar em cache todos os dados da foto para recuperação no futuro
    Preferences.set({
      key: this.FOTO_ARMAZENAMENTO,
      value: JSON.stringify(this.fotos),
    });
  }

  //salvar imagem em um arquivo no dispositivo 
  private async salvarFoto(foto: Photo) {
    // Converta a foto para o formato base64, exigido pela API do sistema de arquivos para salvar
    const base64data = await this.readAsBase64(foto);

    // Gravar o arquivo no diretório de dados
    const nomeArquivo = new Date().getTime() + '.jpeg';
    const arquivoSalvo = await Filesystem.writeFile({
      path: nomeArquivo,
      data: base64data,
      directory: Directory.Data,
    });

    if (this.platform.is('hybrid')) {
      // Exiba a nova imagem reescrevendo o caminho 'file://' para http
      // Detalhes: https://ionicframeworks.com/docs/building/webviewfile-protocol
      return {
        filepath: arquivoSalvo.uri,
        webviewPath: Capacitor.convertFileSrc(arquivoSalvo.uri),
      };
    } else {
      // Use o webpath para exibir a nova imagem em vez da base64, pois ela já está carregada na memória
      return {
        filepath: nomeArquivo,
        webviewPath: foto.webPath,
      };
    }
  }
  //Leia a foto da camera no formato base64 com base na plataforma em que o aplicativo está sendo executado
  private async readAsBase64(foto: Photo) {
    // "híbrido" detectará Cordova ou Capacitor
    if (this.platform.is('hybrid')) {
      // Ler o arquivo no formato base64
      const arquivo = await Filesystem.readFile({
        path: foto.path as string,
      });

      return arquivo.data;
    } else {
      // Obtenha a foto. leia-a como um blob e, em seguida, converta-a para o formato base64
      const resposta = await fetch(foto.webPath!);
      const blob = await resposta.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  // Excluir a imagem, removendo-a dos dados de referência e do sistema de arquivos
  public async deletePicture(foto: Foto, posicao: number) {
    // Remover essa foto da matriz de fotos sobrescrevendo a matriz de fotos existente
    this.fotos.splice(posicao, 1);

    // Atualizar o cache da matriz de fotos sobrescrevendo a matriz de fotos existente
    Preferences.set({
      key: this.FOTO_ARMAZENAMENTO,
      value: JSON.stringify(this.fotos),
    });

    // Excluir o arquivo de foto do sistema de arquivos
    const nomeArquivo = foto.filepath.substr(foto.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: nomeArquivo,
      directory: Directory.Data,
    });
  }

  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
