import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FaceModalPageRoutingModule } from './face-modal-routing.module';

import { FaceModalPage } from './face-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FaceModalPageRoutingModule
  ],
  declarations: [FaceModalPage]
})
export class FaceModalPageModule {}
