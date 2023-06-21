import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FaceModalPage } from './face-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FaceModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaceModalPageRoutingModule {}
