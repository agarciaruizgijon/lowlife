import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrderEdit } from './admin-order-edit';

describe('AdminOrderEdit', () => {
  let component: AdminOrderEdit;
  let fixture: ComponentFixture<AdminOrderEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminOrderEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrderEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
