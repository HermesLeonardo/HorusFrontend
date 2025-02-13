import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {LoginComponent} from './login/login.component';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [  
  ],
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    CardModule,
    InputTextModule,
    ButtonModule
  ],
  exports: [LoginComponent]  
})
export class AuthModule { }
