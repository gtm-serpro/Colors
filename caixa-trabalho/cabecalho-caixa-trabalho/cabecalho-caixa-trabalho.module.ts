import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import { CabecalhoCaixaTrabalhoComponent } from './cabecalho-caixa-trabalho.component';
import { CabecalhoCaixaTrabalhoService } from './cabecalho-caixa-trabalho.service';
import { CaixaTrabalhoService } from '../shared/services/caixa-trabalho.service';
import { EprocessoAutocompleteModule } from 'app/ngx/shared/modules/eprocesso-autocomplete/eprocesso-autocomplete.module';

@NgModule({
    imports: [ CommonModule,
               FormsModule,
               EprocessoAutocompleteModule
            ],
    declarations: [CabecalhoCaixaTrabalhoComponent],
    entryComponents: [CabecalhoCaixaTrabalhoComponent],
    exports: [CabecalhoCaixaTrabalhoComponent],
    providers: [
        CaixaTrabalhoService,
        CabecalhoCaixaTrabalhoService
    ]
})
export class CabecalhoCaixaTrabalhoModule { }