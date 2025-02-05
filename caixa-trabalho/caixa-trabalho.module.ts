import { LocalizadorProcessoService } from "./../shared/services/processo/localizador-processo.service";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalModule } from "ngx-bootstrap/modal";
import { PopoverModule } from "ngx-bootstrap/popover";
import { FormsModule } from "@angular/forms";
import { CaixaTrabalhoRoutingModule } from "./caixa-trabalho-routing.module";
import { CaixaTrabalhoComponent } from "./caixa-trabalho.component";
import { CaixaTrabalhoService } from "./shared/services/caixa-trabalho.service";
import { EprocessoGridModule } from "../shared/modules/eprocesso-grid/eprocesso-grid.module";
import { LinkNumeroProcessoModule } from "../shared/modules/link-numero-processo/link-numero-processo.module";
import { LinkLoteModule } from "../shared/modules/link-lote/link-lote.module";
import { CaixaTrabalhoValidacoesService } from "./shared/services/validacoes-caixa-trabalho.service";
import { AtividadeTipoUnidadeService } from "main/ts/atividade/AtividadeTipoUnidadeService";
import { EprocessoAutocompleteModule } from "../shared/modules/eprocesso-autocomplete/eprocesso-autocomplete.module";
import { EquipeAtividadeService } from "../shared/services/equipe/equipe-atividade.service";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ModalManterNotaModule } from "../notas/shared/components/modals/modal-manter-nota/modal-manter-nota.module";
import { NotasService } from "../notas/shared/service/NotasService";
import { IncluirNotaMultiplosProcessosModule } from "../notas/shared/components/modals/modal-incluir-notas-multipos-processos/incluir-nota-multiplos-processos.module";

@NgModule({
  imports: [
    CommonModule,
    CaixaTrabalhoRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    EprocessoGridModule,
    LinkNumeroProcessoModule,
    LinkLoteModule,
    EprocessoAutocompleteModule,
    ModalManterNotaModule,
    IncluirNotaMultiplosProcessosModule,
    NgbModule.forRoot(),
  ],
  declarations: [CaixaTrabalhoComponent],
  providers: [
    CaixaTrabalhoService,
    CaixaTrabalhoValidacoesService,
    EquipeAtividadeService,
    {
      provide: AtividadeTipoUnidadeService,
      useFactory: ($injector: any) =>
        $injector.get("AtividadeTipoUnidadeService"),
      deps: ["$injector"],
    },
    LocalizadorProcessoService,
    NotasService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CaixaTrabalhoModule {}
