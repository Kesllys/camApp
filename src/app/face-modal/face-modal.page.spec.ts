import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaceModalPage } from './face-modal.page';

describe('FaceModalPage', () => {
  let component: FaceModalPage;
  let fixture: ComponentFixture<FaceModalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FaceModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
