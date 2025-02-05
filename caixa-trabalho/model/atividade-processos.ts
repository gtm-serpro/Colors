import { IAtividade } from "main/ts/domain/IAtividade";
import { EProcessoGridRow } from "app/ngx/shared/modules/eprocesso-grid/models/eprocesso-grid-row";
import { EProcessoGridConfig } from "app/ngx/shared/modules/eprocesso-grid/models/eprocesso-grid-config";
import { TotalizadorCaixaTrabalhoVM } from "./totalizador-caixa-trabalho-vm";
import { FetchDataEvent } from "app/ngx/shared/modules/eprocesso-grid/eprocesso-grid.component";

export interface AtividadeProcessos {
  atividade: IAtividade;
  processos?: EProcessoGridRow[];
  config?: EProcessoGridConfig;
  collapsed: boolean;
  totalizador: TotalizadorCaixaTrabalhoVM;
  ultimoFetchDataEvent?: FetchDataEvent;
  filtering?: boolean;
  atividadeFuturaHorasEstimadas?: IAtividade;
  atividadeFuturaHorasEstimadasSelecionada?: IAtividade;
}