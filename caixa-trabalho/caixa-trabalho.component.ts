import { IProcessoLocalizado } from "./../../../main/ts/domain/IProcessoLocalizado";
import { Params } from "@angular/router/router";
import { LocalizadorProcessoService } from "./../shared/services/processo/localizador-processo.service";
import {
  OnInit,
  Component,
  Renderer,
  ViewChild,
  TemplateRef,
  NgZone,
  OnDestroy,
  Inject,
} from "@angular/core";
import { IFiltroCaixaTrabalho } from "main/ts/domain/IFiltroCaixaTrabalho";
import { CaixaTrabalhoService } from "./shared/services/caixa-trabalho.service";
import { IAtividade } from "main/ts/domain/IAtividade";
import { CabecalhoCaixaTrabalhoService } from "./cabecalho-caixa-trabalho/cabecalho-caixa-trabalho.service";
import { IEquipeCaixaTrabalho } from "main/ts/domain/IEquipeCaixaTrabalho";
import { ICaixaTrabalho } from "../../../main/ts/domain/ICaixaTrabalho";
import { IProcessoApoio } from "../../../main/ts/domain/IProcessoApoio";
import { EProcessoGridConfig } from "../shared/modules/eprocesso-grid/models/eprocesso-grid-config";
import { EProcessoGridColumn } from "../shared/modules/eprocesso-grid/models/eprocesso-grid-column";
import { LoaderService } from "app/ngx/infra/shared/services/loader.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TipoCaixaTrabalhoEnum } from "../shared/models/enums/tipo-caixa-trabalho-enum";
import { EProcessoGridDataSelect } from "../shared/modules/eprocesso-grid/models/eprocesso-grid-data-select";
import { IComboFuncionalidade } from "main/ts/domain/IComboFuncionalidade";
import {
  ModalDirective,
  BsModalService,
  BsModalRef,
} from "ngx-bootstrap/modal";
import { IEquipeAtividade } from "main/ts/domain/IEquipeAtividade";
import { CaixaTrabalhoValidacoesService } from "./shared/services/validacoes-caixa-trabalho.service";
import { PopupService } from "main/ts/libellule/window/PopupService";
import { EProcessoGridRow } from "../shared/modules/eprocesso-grid/models/eprocesso-grid-row";
import { IUsuarioLogado } from "main/ts/domain/IUsuarioLogado";
import { UsuarioLogadoService } from "main/ts/seguranca/UsuarioLogadoService";
import { UsuarioLogadoToken } from "main/ts/App";
import { ILoteCaixaTrabalho } from "main/ts/domain/ILoteCaixaTrabalho";
import { IProcessoSelecionado } from "main/ts/domain/IProcessoSelecionado";
import { AtividadeTipoUnidadeService } from "main/ts/atividade/AtividadeTipoUnidadeService";
import { TotalizadorCaixaTrabalhoVM } from "./model/totalizador-caixa-trabalho-vm";
import { AtividadeProcessos } from "./model/atividade-processos";
import { cloneDeep } from "lodash";
import { Subscription } from "rxjs/Rx";
import { MensagensHandler } from "../infra/shared/services/mensagens-handler.service";
import { ApplicationErrorMessage } from "main/ts/libellule/messages/ApplicationErrorMessage";
import { LocalStorageService } from "angular-2-local-storage";
import { IAtividadeTipoUnidade } from "main/ts/domain/IAtividadeTipoUnidade";
import {
  IColunaCaixaTrabalho,
  ITipoCriterioPesquisa,
} from "main/ts/domain/IColunaCaixaTrabalho";
import { FetchDataEvent } from "../shared/modules/eprocesso-grid/eprocesso-grid.component";
import { EProcessoGridColumnFilter } from "../shared/modules/eprocesso-grid/models/eprocesso-grid-column-filter";
import { Observable } from "rxjs/Rx";
import { EquipeAtividadeService } from "../shared/services/equipe/equipe-atividade.service";
import { ConfigService } from "../shared/services/config/config.service";
import { NgbTabChangeEvent, NgbTabset } from "@ng-bootstrap/ng-bootstrap";
import { IProvidenciaCaixaTrabalho } from "../../../main/ts/domain/IProvidenciaCaixaTrabalho";
import { OperacaoInstanciasProvidencia } from "../providencia/shared/models/operacaoInstanciasProvidencia";
import { InstanciaProvidencia } from "../providencia/shared/models/instanciaProvidencia";
import { MovimentacaoProvidencia } from "../providencia/shared/models/movimentacaoProvidencia";
import { DistribuicaoProvidencia } from "../providencia/shared/models/distribuicaoProvidencia";
import { ProvidenciaDestinoService } from "../providencia-destino/shared/services/providencia-destino.service";
import { Response } from "@angular/http";
import * as StringUtils from "../infra/shared/utils/stringUtils";
import { TelaOrigemEnum } from "app/ngx/shared/models/enums/tela-origem.enum";
import { formatarNivelSigilo } from "../infra/shared/utils/stringUtils";
import { NotasService } from "../notas/shared/service/NotasService";
import { INotaIncluir } from "../notas/shared/domain/INotaIncluir";
import { INota } from "../notas/shared/domain/INota";
import { IProcessoDossie } from "../julgamento/shared/models/interfaces/sigilo/IProcessoDossie";
import { ProcessosService } from "../julgamento/shared/services/processos.service";
import { GrupoProcessoService } from "../processo/shared/services/grupo-processo.service";

enum tipoDistribuicao {
  DISTRIBUIR,
  REDISTRIBUIR,
  LIBERAR,
}

enum funcionalidadeJulgamento {
  INDICAR_PARA_PAUTA,
  RETIRAR_INDICACAO_PAUTA,
  MANTER_EMENTA,
  MANTER_QUESTIONAMENTO,
  INFORMAR_RESULTADO_EXAME_ADMISSIBILIDADE,
  RETIRAR_RELATOR_PROCESSO,
  INFORMAR_DECISAO_MONOCRATICA,
  RETIFICAR_DECISAO_MONOCRATICA,
}

@Component({
  selector: "caixa-trabalho",
  templateUrl: "./caixa-trabalho.component.html",
  styleUrls: [
    "./caixa-trabalho.component.scss".toString(),
    "./modal-horas-estimadas.css".toString(),
  ],
})
export class CaixaTrabalhoComponent implements OnInit, OnDestroy {
  filtros: IFiltroCaixaTrabalho[] = [];
  filtroSelecionado: IFiltroCaixaTrabalho = null;

  equipes: IEquipeCaixaTrabalho[] = [];
  equipeSelecionada: IEquipeCaixaTrabalho = null;
  exibirTodasEquipes: boolean = false;
  agrupadoPorAtividade: boolean = true;
  exibirApensados: boolean = false;
  ehAtividadeProvidencia: boolean = false;
  tipoCaixaTrabalho: TipoCaixaTrabalhoEnum;
  funcionalidades: IComboFuncionalidade[] = [];
  funcionalidadeSelecionada: IComboFuncionalidade = null;
  funcionalidadesProvidencia: IComboFuncionalidade[] = [];
  funcionalidadeSelecionadaProvidencia: IComboFuncionalidade = null;
  mensagemAlerta: string | string[];

  atividadesProcessos: AtividadeProcessos[] = [];
  atividadesProvidencias: AtividadeProcessos[] = [];

  atividadeSelecionadaModalHorasEstimadas: IAtividadeTipoUnidade;

  notaIncluir: INotaIncluir = {
    texto: "",
    destinatarioNota: "",
    numerosProcessos: [],
  };

  todosExpandidos: boolean = false;

  atividadeQueryJaCarregada: boolean = false;
  atividadeQueryJaCarregadaAbaProvidencias: boolean = false;
  processosSelecionados: IProcessoApoio[] = [];

  @ViewChild(NgbTabset) tabset: NgbTabset;

  @ViewChild("columnDataTemplatePrioridade")
  columnDataTemplatePrioridade: TemplateRef<any>;
  @ViewChild("columnDataTemplateInformacoes")
  columnDataTemplateInformacoes: TemplateRef<any>;
  @ViewChild("columnDataTemplateInformacoesProvidencia")
  columnDataTemplateInformacoesProvidencia: TemplateRef<any>;
  @ViewChild("columnDataTemplateIndicadores")
  columnDataTemplateIndicadores: TemplateRef<any>;
  @ViewChild("columnDataTemplateAtividade")
  columnDataTemplateAtividade: TemplateRef<any>;
  @ViewChild("columnDataTemplateNumeroProcesso")
  columnDataTemplateNumeroProcesso: TemplateRef<any>;
  @ViewChild("columnDataTemplateIndicadorDossie")
  columnDataTemplateIndicadorDossie: TemplateRef<any>;
  @ViewChild("columnDataTemplateLote") columnDataTemplateLote: TemplateRef<any>;
  @ViewChild("columnDataTemplateHorasEstimadas")
  columnDataTemplateHorasEstimadas: TemplateRef<any>;
  @ViewChild("columnHeaderTemplateHorasEstimadas")
  columnHeaderTemplateHorasEstimadas: TemplateRef<any>;
  @ViewChild("columnHeaderTemplatePrioridade")
  columnHeaderTemplatePrioridade: TemplateRef<any>;
  @ViewChild("modalAlterarRelator") public modalAlterarRelator: ModalDirective;
  @ViewChild("modalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief")
  public modalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief: ModalDirective;
  @ViewChild("templateModalLocalizadorProcesso")
  templateModalLocalizadorProcesso: TemplateRef<any>;
  @ViewChild("columnDataTemplatePrioridadeProvidencia")
  columnDataTemplatePrioridadeProvidencia: TemplateRef<any>;
  @ViewChild("columnDataTemplateIndicadoresProvidencia")
  columnDataTemplateIndicadoresProvidencia: TemplateRef<any>;
  @ViewChild("columnDataTemplateNumeroProcessoProvidencia")
  columnDataTemplateNumeroProcessoProvidencia: TemplateRef<any>;
  @ViewChild("columnDataTemplateLoteProvidencia")
  columnDataTemplateLoteProvidencia: TemplateRef<any>;
  @ViewChild("columnHeaderTemplateHorasEstimadasProvidencia")
  columnHeaderTemplateHorasEstimadasProvidencia: TemplateRef<any>;
  @ViewChild("columnDataTemplateAtividadeProvidencia")
  columnDataTemplateAtividadeProvidencia: TemplateRef<any>;
  @ViewChild("columnDataTemplateGrauSimilaridade")
  columnDataTemplateGrauSimilaridade: TemplateRef<any>;
  @ViewChild("columnDataTemplateQuantidadeProcessosAgrupamento")
  columnDataTemplateQuantidadeProcessosAgrupamento: TemplateRef<any>;
  @ViewChild("modalIncluirNota") public modalIncluirNota: ModalDirective;

  modalHorasEstimadasRef: BsModalRef;
  modalJuntadosPorApensacaoRef: BsModalRef;
  modalRefLocalizadorProcesso: BsModalRef;

  cabecalhoCaixaTrabalhoServiceSubscription: Subscription;
  completouRequisicaoObterAtividades: boolean = false;
  completouRequisicaoObterAtividadesProv: boolean = false;
  existeProvidenciaEquipe: boolean = false;

  processoLocalizar: string;

  timeoutFechamentoPopup: any;

  apenasProcessosSemResponsavel: boolean = false;

  atividadesConfiguradas: {
    resourceId: string;
    id: number;
    nome: string;
  }[];

  constructor(
    private caixaTrabalhoService: CaixaTrabalhoService,
    private render: Renderer,
    protected cabecalhoCaixaTrabalhoService: CabecalhoCaixaTrabalhoService,
    private loaderService: LoaderService,
    private zone: NgZone,
    private activatedRoute: ActivatedRoute,
    @Inject(PopupService) private popupService: PopupService,
    private validador: CaixaTrabalhoValidacoesService,
    private modalService: BsModalService,
    @Inject(UsuarioLogadoToken) private usuarioLogado: IUsuarioLogado,
    @Inject(UsuarioLogadoService)
    private usuarioLogadoService: UsuarioLogadoService,
    @Inject(AtividadeTipoUnidadeService)
    private atividadeTipoUnidadeService: AtividadeTipoUnidadeService,
    private mensagensHandler: MensagensHandler,
    private localStorageService: LocalStorageService,
    private equipeAtividadeService: EquipeAtividadeService,
    private route: ActivatedRoute,
    private localizadorProcessoService: LocalizadorProcessoService,
    private router: Router,
    private configService: ConfigService,
    private providenciaService: ProvidenciaDestinoService,
    private notasService: NotasService,
    private grupoProcessoService: GrupoProcessoService
  ) {}

  calcularMaxHeightFieldset(): string {
    let maxHeight: number;
    let heightContent = $("#bodyContainer")[0].clientHeight; //Área útil disponível

    let tamanhoMensagens: number = 0;
    let listaMensagens = $("#eprocesso-mensagens-selector")[0].children;
    if (listaMensagens) {
      for (var i = 0; i < listaMensagens.length; i++) {
        tamanhoMensagens += listaMensagens[i].clientHeight;
      }
      tamanhoMensagens =
        tamanhoMensagens > 0 ? tamanhoMensagens + 5 : tamanhoMensagens;
    }

    /**
     * 24px de margin/border/padding do fieldset
     * 28px de content/margin do legend
     * 46px de content/margin da div de combo e botões
     * 16px de 'bônus' por conta da barra de rolagem que já é criada nesse ponto
     * 28px da aba
     * */
    let offsetIE = 1; //para não criar barra de rolagem quando, na prática, não há overflow
    maxHeight = heightContent - 142 - offsetIE - tamanhoMensagens;
    return maxHeight.toString().concat("px");
  }

  ngOnInit() {
    var resourceIdEquipeQuery =
      this.route.snapshot.queryParamMap.get("resourceIdEquipe");
    if (resourceIdEquipeQuery) {
      this.cabecalhoCaixaTrabalhoService.setSelecaoEquipe(
        resourceIdEquipeQuery
      );
    }

    var resourceIdAtividadeQuery = this.route.snapshot.queryParamMap.get(
      "resourceIdAtividade"
    );
    if (resourceIdAtividadeQuery) {
      this.cabecalhoCaixaTrabalhoService.setSelecaoAtividade(
        resourceIdAtividadeQuery
      );
    }

    var abaProvidencia =
      this.route.snapshot.queryParamMap.get("abaProvidencia");
    if (abaProvidencia && abaProvidencia == "S") {
      this.tabset.activeId = "caixaProvidencias";
    }

    this.atividadesProcessos = [];
    this.tipoCaixaTrabalho =
      this.activatedRoute.snapshot.data.tipoCaixaTrabalho;
    this.processoLocalizar = "";
    this.cabecalhoCaixaTrabalhoServiceSubscription =
      this.cabecalhoCaixaTrabalhoService
        .getCarregarAtividadesProcesso()
        .subscribe((data) => {
          this.apagarMensagens();
          this.mostrarMensagemLocalizadorProcesso();

          this.todosExpandidos = false;

          this.atividadesProcessos = [];

          //Dados do cabeçalho
          this.equipeSelecionada = data.equipeSelecionada;
          this.filtroSelecionado = data.filtroSelecionado;
          this.agrupadoPorAtividade = data.agrupadoPorAtividade;
          this.exibirApensados = data.exibirApensados;

          if (this.equipeSelecionada) {
            if (!this.atividadeQueryJaCarregada) {
              var resourceIdAtividadeQuery =
                this.route.snapshot.queryParamMap.get("resourceIdAtividade");
              if (resourceIdEquipeQuery && !resourceIdAtividadeQuery) {
                this.agrupadoPorAtividade = false;
              }
            }
            // verifica a aba ativa
            this.ehAtividadeProvidencia =
              this.tabset.activeId == "caixaProvidencias";
            // obtém as atividades da Providência e de processo
            this.carregarAtividadesProvidencia();
            this.carregarAtividadesProcessos();
          }
        });

    this.cabecalhoCaixaTrabalhoService.setExibirCabecalho(true);
    this.cabecalhoCaixaTrabalhoService.tipoCaixaTrabalho =
      this.tipoCaixaTrabalho;
    this.carregarComboFuncionalidades();

    this.cabecalhoCaixaTrabalhoService.setInibirControlesCabecalho(
      this.ehAtividadeProvidencia
    );
    this.carregarComboFuncionalidadesProvidencia();

    (<any>window).selfCaixaTrabalho = this;

    (<any>window).fnCallbackRetornoPopupJava = function () {
      (<any>window).selfCaixaTrabalho.recarregarProcessos();
      (<any>window).selfCaixaTrabalho.recarregarProvidencias();
    };
    (<any>window).recarregaTela = function () {
      (<any>window).selfCaixaTrabalho.recarregarProcessos();
    };
    (<any>window).atualizarDevidoMovimentacao = function (chaveAtividade) {
      clearTimeout((<any>window).timeoutFechamentoPopup);

      (<any>window).selfCaixaTrabalho.recarregarProcessos();
    };
    (<any>window).atualizarDevidoAlteracaoPalavrasChave = function () {
      (<any>window).selfCaixaTrabalho.recarregarProcessos();
    };
    (<any>window).fnCallbackRetornoPopupProvidenciaSucesso = function (
      retornoPopup
    ) {
      (<any>window).selfCaixaTrabalho.apagarMensagens();
      (<any>window).selfCaixaTrabalho.recarregarProvidencias();
      (<any>window).selfCaixaTrabalho.mostrarMensagemSucesso(retornoPopup);
    };
    (<any>window).fnCallbackRetornoPopupInformarProvidenciaSucesso = function (
      retornoPopup
    ) {
      (<any>window).selfCaixaTrabalho.apagarMensagens();
      (<any>window).selfCaixaTrabalho.recarregarProcessos();
      (<any>window).selfCaixaTrabalho.recarregarProvidencias();
      (<any>window).selfCaixaTrabalho.mostrarMensagemSucesso(retornoPopup);
    };
    (<any>window).fnCallbackRetornoPopupProvidenciaErro = function (
      retornoPopup
    ) {
      (<any>window).selfCaixaTrabalho.apagarMensagens();
      (<any>window).selfCaixaTrabalho.mostrarMensagemAlerta(retornoPopup);
    };
    (<any>window).fnCallbackRetornoPopupProvidenciaErroHttp = function (
      retornoPopup
    ) {
      (<any>window).selfCaixaTrabalho.apagarMensagens();
      (<any>window).selfCaixaTrabalho.mostrarMensagemHttp(retornoPopup);
    };

    (<any>window).fnCallbackRetornoPopupProvidenciaRefresh = function (
      retornoPopup
    ) {
      if (retornoPopup) {
        (<any>window).selfCaixaTrabalho.recarregarProvidencias();
      } else {
        (<any>window).selfCaixaTrabalho.recarregarProcessos();
      }
    };

    this.atividadesProcessos = [];

    //this.caixaTrabalhoService.setUrlAsp(this.configService.getUrlAsp());
  }

  private carregarAtividadesProcessos() {
    if (this.agrupadoPorAtividade) {
      var caixaTrabalho: ICaixaTrabalho = {
        resourceIdEquipe: this.equipeSelecionada.resourceId,
        resourceIdFiltro: this.filtroSelecionado
          ? this.filtroSelecionado.resourceId
          : "",
        apenasUsuario: this.caixaTrabalhoUsuario,
        exibirApensados: this.exibirApensados,
        atividadeProvidencia: this.ehAtividadeProvidencia,
      };

      this.exibirLoading();
      this.completouRequisicaoObterAtividades = false;
      this.caixaTrabalhoService
        .obterAtividades(caixaTrabalho)
        .finally(() => {
          this.ocultarLoading();
        })
        .subscribe((data) => {
          this.atividadesProcessos = [];
          data.forEach((response) =>
            this.atividadesProcessos.push({
              atividade: response,
              collapsed: true,
              totalizador: new TotalizadorCaixaTrabalhoVM(),
            })
          );

          this.obterApenasColunas();
          this.completouRequisicaoObterAtividades = true;
        });
    } else {
      this.atividadesProcessos = [];
      this.atividadesProcessos.push({
        atividade: {
          resourceId: null,
          id: 0,
          nome: "Processos da equipe",
        },
        collapsed: true,
        totalizador: new TotalizadorCaixaTrabalhoVM(),
      });
      this.obterApenasColunas();
    }

    this.atividadeTipoUnidadeService
      .obterAtividadesConfiguradas(
        this.equipeSelecionada.resourceIdTipoUnidade,
        "N"
      )
      .then((atv) => {
        this.atividadesConfiguradas = atv
          .filter((atv) => atv.indicadorAtivo)
          .map((atv) => {
            return {
              resourceId: atv.resourceIdAtividade,
              id: Number.parseInt(atv.idAtividade),
              nome: atv.nome,
            };
          });
      });
  }

  private mostrarMensagemLocalizadorProcesso() {
    let msgLocalizador: string;
    if (
      (msgLocalizador =
        this.localizadorProcessoService.getMensagemProcessosNaoLocalizados())
        .length > 0
    ) {
      this.mensagensHandler.handleError([
        { uid: "", description: msgLocalizador },
      ]);
    }
  }

  expandirContrairTodos() {
    this.todosExpandidos = !this.todosExpandidos;

    var atividadesAccordion = document.getElementsByName("atividadeAccordion");
    var listaAtividades = Array.prototype.slice.call(atividadesAccordion);

    listaAtividades.forEach((element, i) => {
      if (
        (this.todosExpandidos && element.className.includes("collapsed")) ||
        (!this.todosExpandidos && !element.className.includes("collapsed"))
      ) {
        //setTimeout(() => {
        element.click();
        //}, i * 1000);
      }
    });
  }

  verificarFechamentoPopup(newWindow?) {
    var popup = newWindow ? newWindow : (<any>window).dialogWin.win;

    function verificarFechamento() {
      (<any>window).timeoutFechamentoPopup = setTimeout(() => {
        if (!popup.closed) {
          verificarFechamento();
        } else {
          (<any>window).fnCallbackRetornoPopupJava();
        }
      }, 500);
    }

    verificarFechamento();
  }

  _modalHorasEstimadas: {
    config: EProcessoGridConfig;
    processos: EProcessoGridRow[];
    totalizador: TotalizadorCaixaTrabalhoVM;
  } = {
    config: undefined,
    processos: [],
    totalizador: new TotalizadorCaixaTrabalhoVM(),
  };

  processosForamCarregados(idDivGrid: string): boolean {
    if ($(`#${idDivGrid}`).parent().parent()[0]) {
      var idAtividade: number = Number.parseInt(
        $(`#${idDivGrid}`)
          .parent()
          .parent()[0]
          .id.replace("grid-atividade-", "")
      );
      var atividadeProcesso = this.atividadesProcessos.find(
        (item) => item.atividade.id === idAtividade
      );
      if (atividadeProcesso) {
        var processos = atividadeProcesso.processos;
        if (processos && processos.length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  }

  fnGetVisibleRows(idDivGrid: string): Function {
    let idAtividade: number = Number.parseInt(
      $(`#${idDivGrid}`).parent().parent()[0].id.replace("grid-atividade-", "")
    );
    return (processos: EProcessoGridRow[]) => {
      if (
        processos.length > 0 &&
        (processos[0].data.dadosFixosProcesso.equipeAtividadeAtual
          .idAtividade === idAtividade ||
          idAtividade === 0)
      ) {
        this._modalHorasEstimadas.processos = cloneDeep(processos);
        this._modalHorasEstimadas.config = {
          colunaSelecao: true,
          paginacao: false,
          colunas: this.atividadesProcessos.find(
            (item) => item.atividade.id === idAtividade
          ).config.colunas,
        };
        this._modalHorasEstimadas.totalizador.numeroProcessosFiltrados =
          processos.length;
      }
    };
  }

  ngOnDestroy(): void {
    this.atividadesProcessos = [];
    this.cabecalhoCaixaTrabalhoService.setExibirCabecalho(false);
    this.cabecalhoCaixaTrabalhoService.limparComboEquipe();
    this.cabecalhoCaixaTrabalhoService.limparComboFiltro();

    if (this.cabecalhoCaixaTrabalhoServiceSubscription) {
      this.cabecalhoCaixaTrabalhoServiceSubscription.unsubscribe();
    }

    this.apagarMensagens();
  }

  toggleSymbol(event: any) {
    event.preventDefault();
    this.render.setElementClass(
      event.target,
      "active",
      !event.target.classList.contains("active")
    );
  }

  toggleAtividade(atividadeSelecionada: IAtividade) {
    let atividadeProcesso = this.atividadesProcessos.find(
      (item) => item.atividade.resourceId === atividadeSelecionada.resourceId
    );

    if (!atividadeProcesso.collapsed) {
      atividadeProcesso.collapsed = true;
      atividadeProcesso.processos = undefined;
      return;
    } else {
      this.atualizarProcessos(atividadeProcesso);
    }
  }

  recarregarProcessos() {
    if (this.agrupadoPorAtividade) {
      this.zone.run(() => {
        //Obtém novas atividades que passaram a ter algum novo processo

        var caixaTrabalho: ICaixaTrabalho = {
          resourceIdEquipe: this.equipeSelecionada.resourceId,
          resourceIdFiltro: this.filtroSelecionado
            ? this.filtroSelecionado.resourceId
            : "",
          apenasUsuario: this.caixaTrabalhoUsuario,
          exibirApensados: this.exibirApensados,
          atividadeProvidencia: this.ehAtividadeProvidencia,
          apenasProcessosSemResponsavel: this.apenasProcessosSemResponsavel
            ? true
            : false,
        };

        this.exibirLoading();
        this.caixaTrabalhoService
          .obterAtividades(caixaTrabalho)
          .finally(() => {
            //this.ocultarLoading();
          })
          .subscribe((data) => {
            data.forEach((response) => {
              var atividadeExiste = this.atividadesProcessos.some(
                (atividadeProcesso) => {
                  return (
                    atividadeProcesso.atividade.resourceId ===
                    response.resourceId
                  );
                }
              );

              if (!atividadeExiste) {
                var novaAtividadeProcessos = {
                  atividade: response,
                  collapsed: true,
                  totalizador: new TotalizadorCaixaTrabalhoVM(),
                  config: {
                    colunaSelecao: true,
                    paginacao: true,
                    colunas: (<any>this.atividadesProcessos[0]).config.colunas,
                  },
                };
                this.atividadesProcessos.push(novaAtividadeProcessos);
              }
            });

            //Pode ser que alguma atividade não tenha processo sem responsável. Deve ser removida
            if (this.apenasProcessosSemResponsavel) {
              this.atividadesProcessos = this.atividadesProcessos.filter(
                (atividadeProcesso) => {
                  return data.some((response) => {
                    return (
                      response.resourceId ===
                      atividadeProcesso.atividade.resourceId
                    );
                  });
                }
              );
            }

            this.atividadesProcessos.sort((a, b) => {
              return a.atividade.nome.localeCompare(b.atividade.nome);
            });

            //Recarrega os processos das atividades expandidas
            var atividadesSelecionadas = this.atividadesProcessos.filter(
              (atividade) => {
                return !atividade.collapsed;
              }
            );

            atividadesSelecionadas.forEach((atividadeSelecionada) => {
              this.atualizarProcessos(atividadeSelecionada);
            });
          });
      });
    } else {
      //Atualiza a única grid caso não esteja agrupado por atividades
      if (
        this.atividadesProcessos &&
        this.atividadesProcessos.length === 1 &&
        !(<any>this.atividadesProcessos[0]).collapsed
      ) {
        this.atualizarProcessos(this.atividadesProcessos[0]);
      }
    }
  }

  loadConfigAtividade(
    atividadeProcesso: AtividadeProcessos,
    colunas: IColunaCaixaTrabalho[],
    textoFiltro?: string[],
    ehProvidencia?: boolean
  ) {
    if (ehProvidencia) {
      var colunaPrioridade = this.colunaPrioridadeProvidencia;
      var colunaIndicadores = this.colunaIndicadoresProvidencia;
      var colunaNumeroProcesso =
        this.columnDataTemplateNumeroProcessoProvidencia;
      var colunaLote = this.columnDataTemplateLoteProvidencia;
      var colunaHorasEstimadas =
        this.columnHeaderTemplateHorasEstimadasProvidencia;
      var colunaAtividade = this.colunaAtividadeProvidencia;
      var colunaInformacoes = this.colunaInformacoesProvidencia;
      var atributoHE = "horasEstimadasProvidencia";
    } else {
      var colunaPrioridade = this.colunaPrioridade;
      var colunaIndicadores = this.colunaIndicadores;
      var colunaNumeroProcesso = this.columnDataTemplateNumeroProcesso;
      var colunaLote = this.columnDataTemplateLote;
      var colunaHorasEstimadas = this.columnHeaderTemplateHorasEstimadas;
      var colunaAtividade = this.colunaAtividade;
      var colunaInformacoes = this.colunaInformacoes;
      var atributoHE = "qtdHorasEstimadas";
    }

    atividadeProcesso.config = {
      colunaSelecao: true,
      paginacao: true,
      colunas: colunas.map((coluna) => {
        //data[0].colunas
        let col: EProcessoGridColumn = {
          cabecalho:
            coluna.atributo !== "qtdHorasEstimadas"
              ? coluna.titulo
              : colunaHorasEstimadas,
          atributo:
            coluna.atributo !== "qtdHorasEstimadas"
              ? coluna.atributo
              : atributoHE,
          ordenacao: true,
          filtro: {
            texto:
              textoFiltro && coluna.atributo === "numeroProcesso"
                ? textoFiltro.join(",")
                : "",
            criterio: coluna.filtro,
          },
          cssWidth: 240,
          hint: coluna.hint,
          ehMoeda: coluna.ehMoeda,
        };

        if (coluna.atributo === "numeroProcesso") {
          col.columnDataTemplate = colunaNumeroProcesso;
        } else if (coluna.atributo === "nomeLoteAtual") {
          col.columnDataTemplate = colunaLote;
        } else if (coluna.atributo === "indicadorDossie") {
          col.columnDataTemplate = this.columnDataTemplateIndicadorDossie;
        } else if (coluna.atributo === "qtdHorasEstimadas" && !ehProvidencia) {
          col.columnDataTemplate = this.columnDataTemplateHorasEstimadas;
        } else if (coluna.atributo === "grauSimilaridadeAgrupamento") {
          col.columnDataTemplate = this.columnDataTemplateGrauSimilaridade;
        } else if (coluna.atributo === "quantidadeProcessosAgrupamento") {
          col.columnDataTemplate =
            this.columnDataTemplateQuantidadeProcessosAgrupamento;
        }

        return col;
      }),
    };

    if (this.agrupadoPorAtividade) {
      atividadeProcesso.config.colunas.unshift(
        colunaPrioridade,
        colunaInformacoes,
        colunaIndicadores
      );
    } else {
      atividadeProcesso.config.colunas.unshift(
        colunaPrioridade,
        colunaInformacoes,
        colunaIndicadores,
        colunaAtividade
      );
    }
  }

  obterApenasColunas() {
    var caixaTrabalho: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : null,
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: this.exibirApensados,
      atividadeProvidencia: this.ehAtividadeProvidencia,
      apenasColunas: true,
    };

    this.exibirLoading();
    this.caixaTrabalhoService
      .obterProcessos(caixaTrabalho)
      .finally(() => {
        this.ocultarLoading();
      })
      .subscribe((data) => {
        this.validador.setUsuarioSupervisor(data[0].usuarioEhSupervisor);

        var resourceIdEquipeQuery =
          this.route.snapshot.queryParamMap.get("resourceIdEquipe");
        var resourceIdAtividadeQuery = this.route.snapshot.queryParamMap.get(
          "resourceIdAtividade"
        );
        var numerosProcessosQuery =
          this.route.snapshot.queryParamMap.get("numerosProcessos");

        this.atividadesProcessos.forEach((atividadeProcesso) => {
          if (
            !this.atividadeQueryJaCarregada &&
            numerosProcessosQuery &&
            ((resourceIdAtividadeQuery &&
              atividadeProcesso.atividade.resourceId ===
                resourceIdAtividadeQuery) ||
              (!resourceIdAtividadeQuery && resourceIdEquipeQuery))
          ) {
            this.loadConfigAtividade(
              atividadeProcesso,
              data[0].colunas,
              numerosProcessosQuery.split("|")
            );
          } else {
            this.loadConfigAtividade(atividadeProcesso, data[0].colunas);
          }
        });

        if (!this.atividadeQueryJaCarregada) {
          this.atividadesProcessos.forEach((atividadeProcesso) => {
            if (
              (resourceIdAtividadeQuery &&
                atividadeProcesso.atividade.resourceId ===
                  resourceIdAtividadeQuery) ||
              (!resourceIdAtividadeQuery && resourceIdEquipeQuery)
            ) {
              this.toggleAtividade(atividadeProcesso.atividade);
            }
          });

          this.atividadeQueryJaCarregada = true;
        }
      });
  }

  identificarOperador(
    coluna: EProcessoGridColumn
  ): "BETWEEN" | "ISNULL" | "IN" | "LIKE" {
    if ((<EProcessoGridColumnFilter>coluna.filtro).criterio.intervalo) {
      return "BETWEEN";
    }

    if ((<EProcessoGridColumnFilter>coluna.filtro).textoVazio) {
      return "ISNULL";
    }

    if (coluna.atributo === "numeroProcesso") {
      return "IN";
    }

    return "LIKE";
  }

  identificarTipoValor(
    coluna: EProcessoGridColumn
  ): "DATA" | "NUMERO" | "TEXTO" {
    if (
      (<EProcessoGridColumnFilter>coluna.filtro).criterio.tipo ===
      ITipoCriterioPesquisa.PERIODO
    ) {
      return "DATA";
    }

    if (
      (<EProcessoGridColumnFilter>coluna.filtro).criterio.tipo ===
      ITipoCriterioPesquisa.NUMERO
    ) {
      return "NUMERO";
    }

    if (coluna.atributo === "qtdHorasEstimadas") {
      return "NUMERO";
    }

    return "TEXTO";
  }

  obterProcessos(
    atividadeProcesso: AtividadeProcessos,
    pagina: number,
    itensPorPagina: number,
    colunasOrdenar: EProcessoGridColumn[],
    colunasFiltrar: EProcessoGridColumn[]
  ) {
    var ordenadores = [];
    if (colunasOrdenar && colunasOrdenar.length > 0) {
      var tipoSort =
        colunasOrdenar[0].ordenacao === "asc"
          ? "ASC"
          : colunasOrdenar[0].ordenacao === "desc"
          ? "DESC"
          : undefined;
      ordenadores.push({
        atributo:
          colunasOrdenar[0].atributo ===
          "dadosFixosProcesso.indicadorPrioridade"
            ? "prioridade"
            : colunasOrdenar[0].atributo ===
              "dadosFixosProcesso.nomeAtividadeAtual"
            ? "nomeAtividadeAtual"
            : colunasOrdenar[0].atributo,
        tipo: tipoSort,
      });
    }

    var filtros = [];
    if (colunasFiltrar && colunasFiltrar.length > 0) {
      colunasFiltrar.forEach((coluna) => {
        //OPERADOR
        var operador = this.identificarOperador(coluna);

        //TIPO VALOR
        var tipoValor = this.identificarTipoValor(coluna);

        //VALORES
        var valores: string[] = [];
        if (coluna.atributo === "numeroProcesso") {
          var listaNumerosProcessos = (<EProcessoGridColumnFilter>coluna.filtro)
            .texto;
          if (listaNumerosProcessos && listaNumerosProcessos.trim() != "") {
            valores = listaNumerosProcessos
              .split(",")
              .map((numeroProcesso) =>
                numeroProcesso.trim().replace(/[^0-9]/g, "")
              );
          }
        } else {
          var valor = (<EProcessoGridColumnFilter>coluna.filtro).texto;
          if (valor && tipoValor === "NUMERO") {
            //Remove caracteres não-numéricos
            if (coluna.atributo === "qtdHorasEstimadas") {
              var tempo = valor.split(":");
              valor = (
                Number.parseInt(tempo[0]) * 60 +
                Number.parseInt(tempo[1])
              ).toString();
            } else {
              valor = valor.replace(/[^0-9]/g, "");
            }
          }
          if (valor && valor.trim() != "") {
            valores.push(valor.trim());
          } else if (operador === "BETWEEN") {
            valores.push("");
          }

          var valorSecundario = (<EProcessoGridColumnFilter>coluna.filtro)
            .textoSecundario;
          if (valorSecundario && tipoValor === "NUMERO") {
            //Remove caracteres não-numéricos
            if (coluna.atributo === "qtdHorasEstimadas") {
              var tempo = valorSecundario.split(":");
              valorSecundario = (
                Number.parseInt(tempo[0]) * 60 +
                Number.parseInt(tempo[1])
              ).toString();
            } else {
              valorSecundario = valorSecundario.replace(/[^0-9]/g, "");
            }
          }
          if (valorSecundario && valorSecundario.trim() != "") {
            valores.push(valorSecundario);
          } else if (operador === "BETWEEN") {
            valores.push("");
          }
        }

        filtros.push({
          atributo: coluna.atributo,
          operador: operador,
          tipoValor: tipoValor,
          valores: valores,
        });
      });
    }

    var caixaTrabalho: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : null,
      resourceIdAtividade: atividadeProcesso.atividade.resourceId,
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: this.exibirApensados,
      atividadeProvidencia: this.ehAtividadeProvidencia,
      eprocessoPaginador: {
        pagina: pagina,
        limite: itensPorPagina,
        ordens: ordenadores,
        filtros: filtros,
      },
    };

    if (atividadeProcesso.atividadeFuturaHorasEstimadas) {
      caixaTrabalho.resourceIdAtividadeHorasEstimadas =
        atividadeProcesso.atividadeFuturaHorasEstimadas.resourceId;
    }

    var filtroInformado: boolean = colunasFiltrar && colunasFiltrar.length > 0;

    this.exibirLoading();
    this.caixaTrabalhoService
      .obterProcessos(caixaTrabalho)
      .finally(() => {
        this.ocultarLoading();
        if (!this.atividadeQueryJaCarregada) {
          this.scrollToAtividade(atividadeProcesso.atividade);
        }
      })
      .subscribe((data) => {
        atividadeProcesso.collapsed = false;
        this.validador.setUsuarioSupervisor(data[0].usuarioEhSupervisor);
        if (
          (data[0].processos && data[0].processos.length > 0) ||
          filtroInformado
        ) {
          atividadeProcesso.processos = data[0].processos.map((processo) => {
            let row: EProcessoGridRow = { data: processo };
            if (processo.dadosFixosProcesso.exibirEmNegrito) {
              row.styleCss = { "font-weight": "bold" };
            }
            return row;
          });

          if (filtroInformado) {
            if (atividadeProcesso.processos.length === 0) {
              alert(
                "Nenhum processo encontrado. Verifique se existe algum filtro aplicado (processo apensado ou filtro dinâmico) e realize nova pesquisa."
              );
            } else if (
              colunasFiltrar.some(
                (coluna) => coluna.atributo === "numeroProcesso"
              )
            ) {
              var colunaNumeroProcesso = colunasFiltrar.find(
                (coluna) => coluna.atributo === "numeroProcesso"
              );
              var numerosProcessosFiltro: string[] = colunaNumeroProcesso
                ? (<EProcessoGridColumnFilter>(
                    colunaNumeroProcesso.filtro
                  )).texto.split(",")
                : [];
              var processosNaoEncontrados = "";

              numerosProcessosFiltro.forEach((numeroProcessoFiltro) => {
                if (numeroProcessoFiltro.trim() !== "") {
                  var numeroRetornadoNaConsulta =
                    atividadeProcesso.processos.some(
                      (processo) =>
                        processo.data.dadosFixosProcesso.numeroProcesso ===
                        numeroProcessoFiltro.trim().replace(/^0+|[^0-9]+/g, "")
                    );

                  if (!numeroRetornadoNaConsulta) {
                    processosNaoEncontrados += numeroProcessoFiltro + ", ";
                  }
                }
              });

              if (processosNaoEncontrados !== "") {
                processosNaoEncontrados = processosNaoEncontrados.substring(
                  0,
                  processosNaoEncontrados.length - 2
                );
                alert(
                  "Processo(s) não exibido(s): " +
                    processosNaoEncontrados +
                    "\n\nPossíveis Motivos:\n- Processo(s) não está(ão) na equipe/atividade.\n- Processo(s) está(ão) na aba de providências.\n- A quantidade de processos filtrados é superior ao limite de exibição de processos por página (Limite atual: " +
                    itensPorPagina +
                    ". Aumente o limite e realize nova busca)."
                );
              }
            }
          }
        } else if (pagina === 1 && !filtroInformado) {
          this.atividadesProcessos = this.atividadesProcessos.filter(
            (item) =>
              item.atividade.resourceId !==
              atividadeProcesso.atividade.resourceId
          );
        } else {
          alert(
            "Não existe próxima página. A paginação se encontra na última página."
          );
          $(
            "#grid-atividade-" +
              atividadeProcesso.atividade.id +
              " a#paginacao-grid-eprocesso-botao-anterior"
          )[0].click();
        }
      });
  }

  private get colunaPrioridade(): EProcessoGridColumn {
    return {
      cabecalho: this.columnHeaderTemplatePrioridade,
      atributo: "dadosFixosProcesso.indicadorPrioridade",
      ordenacao: true,
      filtro: false,
      columnDataTemplate: this.columnDataTemplatePrioridade,
      cssTextCenter: false,
      ehMoeda: false,
      cssWidth: 50,
      cssSemOverflow: true,
    };
  }

  private get colunaInformacoes(): EProcessoGridColumn {
    return {
      cabecalho: "Informações",
      ordenacao: false,
      filtro: false,
      columnDataTemplate: this.columnDataTemplateInformacoes,
      ehMoeda: false,
    };
  }

  private get colunaInformacoesProvidencia(): EProcessoGridColumn {
    return {
      cabecalho: "Informações",
      ordenacao: false,
      filtro: false,
      columnDataTemplate: this.columnDataTemplateInformacoesProvidencia,
      ehMoeda: false,
    };
  }

  private get colunaIndicadores(): EProcessoGridColumn {
    return {
      cabecalho: "Indicadores",
      ordenacao: false,
      filtro: false,
      columnDataTemplate: this.columnDataTemplateIndicadores,
      ehMoeda: false,
    };
  }

  private get colunaAtividade(): EProcessoGridColumn {
    return {
      cabecalho: "Nome Atividade Atual",
      ordenacao: true,
      atributo: "dadosFixosProcesso.nomeAtividadeAtual",
      filtro: false,
      columnDataTemplate: this.columnDataTemplateAtividade,
      ehMoeda: false,
    };
  }

  abrirModalJuntadosPorApensacao(
    processoApoio: IProcessoApoio,
    template: TemplateRef<any>
  ) {
    this.caixaTrabalhoService
      .obterApensados(processoApoio.dadosFixosProcesso.numeroProcesso)
      .subscribe((apensados) => {
        this.modalJuntadosPorApensacaoRef = this.modalService.show(template, {
          keyboard: false,
          ignoreBackdropClick: true,
          class: "modal-horas-estimadas-full-width",
        });
        this.modalJuntadosPorApensacaoRef.content = apensados;
      });
  }

  toggleApensados(processoApoio: IProcessoApoio) {
    if ((<any>processoApoio).processoExpandido) {
      this.contrairApensados(processoApoio);
      (<any>processoApoio).processoExpandido = false;
    } else {
      this.expandirApensados(processoApoio);
      (<any>processoApoio).processoExpandido = true;
    }
  }

  contrairApensados(processoApoio: IProcessoApoio) {
    var atividadeProcesso = this.atividadesProcessos.find(function (
      atividadeProcesso
    ) {
      if (
        atividadeProcesso.processos &&
        atividadeProcesso.processos.length > 0
      ) {
        return (
          atividadeProcesso.processos.findIndex(function (processo) {
            return (
              processo.data.dadosFixosProcesso.numeroProcesso ===
              processoApoio.dadosFixosProcesso.numeroProcesso
            );
          }) > -1
        );
      }

      return false;
    });

    atividadeProcesso.processos = atividadeProcesso.processos.filter(function (
      processo
    ) {
      return (
        (<any>processo).data.numeroProcessoFormatadoPai !==
        processoApoio.dadosFixosProcesso.numeroProcessoFormatado
      );
    });
  }

  expandirApensados(processoApoio: IProcessoApoio) {
    var indiceProcessoPai;

    var atividadeProcesso = this.atividadesProcessos.find(function (
      atividadeProcesso
    ) {
      if (
        atividadeProcesso.processos &&
        atividadeProcesso.processos.length > 0
      ) {
        indiceProcessoPai = atividadeProcesso.processos.findIndex(function (
          processo
        ) {
          return (
            processo.data.dadosFixosProcesso.numeroProcesso ===
            processoApoio.dadosFixosProcesso.numeroProcesso
          );
        });

        return indiceProcessoPai > -1;
      }

      return false;
    });

    var caixaTrabalho: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : null,
      resourceIdAtividade: atividadeProcesso.atividade.resourceId,
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: this.exibirApensados,
      atividadeProvidencia: this.ehAtividadeProvidencia,
      processoPrincipalApensados:
        processoApoio.dadosFixosProcesso.numeroProcesso,
      resourceIdAtividadeHorasEstimadas:
        atividadeProcesso.atividadeFuturaHorasEstimadas
          ? atividadeProcesso.atividadeFuturaHorasEstimadas.resourceId
          : null,
    };

    this.caixaTrabalhoService
      .obterApensadosPrimeiroNivel(caixaTrabalho)
      .subscribe((data) => {
        var processosApensados: EProcessoGridRow[] = data[0].processos.map(
          (processo) => {
            processo.dadosFixosProcesso.quantidadeApensados = 0;
            (<any>processo).numeroProcessoFormatadoPai =
              processoApoio.dadosFixosProcesso.numeroProcessoFormatado;

            let row: EProcessoGridRow = { data: processo };

            if (processo.dadosFixosProcesso.exibirEmNegrito) {
              row.styleCss = { "font-weight": "bold" };
            }

            return row;
          }
        );
        atividadeProcesso.processos.splice(
          indiceProcessoPai + 1,
          0,
          ...processosApensados
        );
        atividadeProcesso.processos = atividadeProcesso.processos.slice();
      });
  }

  abrirModalHorasEstimadas(event: any, template: TemplateRef<any>) {
    event.stopPropagation();

    this.exibirLoading();
    this.atividadeTipoUnidadeService
      .obterAtividadesConfiguradas(
        this.equipeSelecionada.resourceIdTipoUnidade,
        "N"
      )
      .then((atv) => {
        //abrir o modal
        this.modalHorasEstimadasRef = this.modalService.show(template, {
          keyboard: false,
          ignoreBackdropClick: true,
          class: "modal-horas-estimadas-full-width",
        });

        this.modalHorasEstimadasRef.content = atv
          .filter((atv) => atv.indicadorAtivo)
          .map((atv) => {
            return {
              resourceId: atv.resourceIdAtividade,
              id: Number.parseInt(atv.idAtividade),
              nome: atv.nome,
            };
          });

        var resourceIdHorasEstimadasAtividadeSelecionada =
          this.localStorageService.get<string>(
            "modalHorasEstimadasAtividadeSelecionadaCxTrab"
          );

        if (
          resourceIdHorasEstimadasAtividadeSelecionada &&
          resourceIdHorasEstimadasAtividadeSelecionada.trim() != ""
        ) {
          var atividadePreSelecionado = atv.find((atividade) => {
            return (
              atividade.resourceIdAtividade ===
              resourceIdHorasEstimadasAtividadeSelecionada
            );
          });
          if (atividadePreSelecionado) {
            this.atividadeSelecionadaModalHorasEstimadas =
              atividadePreSelecionado;
          }
        }
      })
      .finally(() => this.ocultarLoading());
  }

  tabelaProcessoHoraEstimadaVisivel: boolean = false;

  modalObterHorasEstimadasProcessos(atividade: IAtividade) {
    this.tabelaProcessoHoraEstimadaVisivel = false;

    if (atividade) {
      let caixaTrabalho: ICaixaTrabalho = {
        resourceIdEquipe: this.equipeSelecionada.resourceId,
        resourceIdAtividade: atividade.resourceId,
        idsProcessos: this._modalHorasEstimadas.processos.map(
          (processoHE) => processoHE.data.dadosFixosProcesso.id
        ),
        atividadeProvidencia: this.ehAtividadeProvidencia,
      } as ICaixaTrabalho;

      this.caixaTrabalhoService
        .obterHorasEstimadas(caixaTrabalho)
        .finally(() => (this.tabelaProcessoHoraEstimadaVisivel = true))
        .subscribe((processosHE) => {
          this._modalHorasEstimadas.totalizador.minutosEstimadosFiltrados = 0;
          processosHE.forEach((processoHEcalculada) => {
            this._modalHorasEstimadas.processos.find(
              (p) =>
                p.data.dadosFixosProcesso.id ===
                processoHEcalculada.dadosFixosProcesso.id
            ).data.qtdHorasEstimadas =
              processoHEcalculada.dadosFixosProcesso.horasEstimadas;

            this._modalHorasEstimadas.totalizador.addHorasEstimadasFiltrados(
              processoHEcalculada.dadosFixosProcesso.horasEstimadas
            );
          });
        });

      this.localStorageService.set(
        "modalHorasEstimadasAtividadeSelecionadaCxTrab",
        atividade.resourceId
      );
    }
  }

  processosSelecionadosChange(
    atividadeProcessos: AtividadeProcessos,
    processos: IProcessoApoio[]
  ) {
    if (atividadeProcessos.processos) {
      atividadeProcessos.totalizador.minutosEstimadosSelecionados = 0;
      atividadeProcessos.totalizador.numeroProcessosSelecionados = 0;

      atividadeProcessos.processos.forEach((p) => {
        if (processos.includes(p.data)) {
          p.data._selecionado = true;
          atividadeProcessos.totalizador.numeroProcessosSelecionados++;
          atividadeProcessos.totalizador.addHorasEstimadasSelecionados(
            p.data.dadosFixosProcesso.horasEstimadas
          );
        } else {
          p.data._selecionado = false;
        }
      });
      this._modalHorasEstimadas.processos.forEach(
        (p) =>
          (p.selected = processos.some(
            (apoio) =>
              apoio.dadosFixosProcesso.id === p.data.dadosFixosProcesso.id
          ))
      );
    }
  }

  processosVisiveisChange(
    atividadeProcessos: AtividadeProcessos,
    processos: IProcessoApoio[]
  ) {
    atividadeProcessos.totalizador.minutosEstimadosFiltrados = 0;
    atividadeProcessos.totalizador.numeroProcessosFiltrados = 0;
    processos.forEach((p) => {
      atividadeProcessos.totalizador.numeroProcessosFiltrados++;
      atividadeProcessos.totalizador.addHorasEstimadasFiltrados(
        p.dadosFixosProcesso.horasEstimadas
      );
    });
  }

  consultarPalavraChave(processoApoio: IProcessoApoio) {
    const numeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    this.popupService.abrirPopupPalavrasChavesProcesso(numeroProcesso);
  }

  consultarHistorico(processoApoio: IProcessoApoio) {
    const numeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    this.popupService.abrirPopupHistoricoProcesso(numeroProcesso);
  }

  consultarJuntada(processoApoio: IProcessoApoio) {
    var psNumeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    var equipeAtividade = processoApoio.dadosFixosProcesso.equipeAtividadeAtual;
    var psEquipeAtividade =
      equipeAtividade.id +
      "|" +
      equipeAtividade.idEquipe +
      "|" +
      equipeAtividade.idTipoUnidade +
      "|1|" +
      equipeAtividade.idAtividade;
    var url =
      "../ControleConsultarJuntadasProcesso.asp?psAcao=apresentarPagina&psNumeroProcesso=" +
      psNumeroProcesso +
      "&psProcessoJuntado=N&psProcessoApensado=N&psEquipeAtividade=" +
      psEquipeAtividade;
    (<any>window).openDialog(url, 800, 600);
  }

  consultarIndicadorNota(processoApoio: IProcessoApoio) {
    var psNumeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    var equipeAtividade = processoApoio.dadosFixosProcesso.equipeAtividadeAtual;
    var psEquipeAtividade =
      equipeAtividade.id +
      "|" +
      equipeAtividade.idEquipe +
      "|" +
      equipeAtividade.idTipoUnidade +
      "|1|" +
      equipeAtividade.idAtividade;
    var url =
      "../ControleNota.asp?psAcao=exibir&psNumeroProcesso=" +
      psNumeroProcesso +
      "&psEscopoNota=NI&psNumeroEquipeAtividade=" +
      psEquipeAtividade;
    (<any>window).openDialog(
      url,
      590,
      400,
      false,
      ",scrollbars=yes",
      0,
      200,
      0,
      0,
      0,
      0
    );
  }

  consultarIndicadorSolicitacaoJuntada(processoApoio: IProcessoApoio) {
    var psNumeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    this.popupService.abrirPopupConsultarSolicitacaoJuntada(psNumeroProcesso);
  }

  consultarIndicadorSolidario(processoApoio: IProcessoApoio) {
    var psNumeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    var psNumeroProcessoFormatado =
      processoApoio.dadosFixosProcesso.numeroProcessoFormatado;
    this.popupService.abrirPopupConsultarInteressadosAdicionais(
      psNumeroProcesso,
      psNumeroProcessoFormatado,
      TelaOrigemEnum.CAIXA_TRABALHO
    );
  }

  definirNivelSigilo(processoApoio: IProcessoApoio) {
    var numeroProcesso = processoApoio.dadosFixosProcesso.numeroProcesso;
    this.popupService.abrirPopupDefinirNivelSigilo(numeroProcesso);
  }

  //Força a exibição do loader ao selecionar um dos filtros na popup
  exibirLoading() {
    this.zone.run(() => {
      this.loaderService.setMsgLoading("Aguarde...");
      this.loaderService.show();
    });
  }

  //Oculta o loader ao selecionar um dos filtros na popup
  ocultarLoading() {
    this.zone.run(() => {
      this.loaderService.hide();
    });
  }

  checkboxLoteChange(
    processoApoio: IProcessoApoio,
    $event: any
  ): EProcessoGridDataSelect[] {
    this.marcarOutrosCheckboxLote($event.target);
    return [
      {
        valor: processoApoio.dadosFixosProcesso.idLoteAtual,
        atributo: "dadosFixosProcesso.idLoteAtual",
        selected: $event.target.checked,
      },
    ];
  }

  private marcarOutrosCheckboxLote(checkboxLote: any) {
    Array.from(
      document.querySelectorAll(
        `#${checkboxLote.id}`
      ) as NodeListOf<HTMLInputElement>
    ).forEach((checkbox) => (checkbox.checked = checkboxLote.checked));
  }

  carregarComboFuncionalidades() {
    this.funcionalidades.push(
      { id: 0, nome: "Selecione Funcionalidade..." },
      { id: 5, nome: "Alterar Localização Física do Processo" },
      { id: 22, nome: "Arquivar Processo" },
      {
        id: 8,
        nome: "Documentos - Assinar em Lote Documentos com Pendência para Mim",
      },
      { id: 7, nome: "Documentos - Efetivar em Lote Documento Minuta" },
      { id: 25, nome: "Documentos - Juntar Documento / Solicitar Juntada" },
      {
        id: 23,
        nome: "Gestão em Horas - Associar / Desassociar Fator de Ajuste de Hora Estimada",
      },
      { id: 13, nome: "Gestão em Horas - Classificar ACT e Tema do Processo" },
      { id: 14, nome: "Gestão em Horas - Responder Ficha de Quesitos" },
      {
        id: 9,
        nome: "Gestão em Horas - Passivo - Apurar Grau do Processo (Antigo)",
      },
      { id: 3, nome: "Incluir / Formar Lote de Processos" },
      {
        id: 12,
        nome: "Informar / Alterar Classificação de Grupo-Tipo-Subtipo do Processo",
      },
      { id: 24, nome: "Informar Palavras-Chaves" },
      {
        id: 18,
        nome: "Julgamento - Incluir / Alterar / Cancelar Questionamento",
      },
      { id: 17, nome: "Julgamento - Incluir / Alterar / Excluir Ementa" },
      { id: 15, nome: "Julgamento - Indicar para Pauta" },
      {
        id: 20,
        nome: "Julgamento - Informar Resultado do Exame de Admissibilidade",
      },
      { id: 27, nome: "Julgamento - Informar Resultado Monocrático" },
      {
        id: 28,
        nome: "Julgamento - Retificar Registro de Último Resultado Monocrático",
      },
      { id: 16, nome: "Julgamento - Retirar Indicação para Pauta" },
      { id: 21, nome: "Julgamento - Retirar o Relator" },
      {
        id: 1,
        nome: "Julgamento - Módulo Antigo - Indicar / Retirar da Pauta",
      },
      //{id: 19, nome: "Providência - Finalizar / Cancelar"},
      { id: 29, nome: "Nota - Incluir" },
      { id: 10, nome: "Providência - Informar" },
      { id: 26, nome: "Solicitar Download de Processo(s)" },
      { id: 4, nome: "Sortear Processo" }
    );

    this.funcionalidadeSelecionada = this.funcionalidades[0];
  }

  acessarFuncionalidade(
    comboFuncionalidade: HTMLSelectElement,
    funcionalidadeSelecionada: any
  ) {
    this.apagarMensagens();

    //Volta a selecionar a primeira opção
    comboFuncionalidade.selectedIndex = 0;

    //Valida se há equipe e processo selecionados
    if (
      !this.validador.existeProcessoSelecionado(
        this.obterProcessosSelecionados()
      )
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    //Chama a funcionalidade
    switch (funcionalidadeSelecionada.id) {
      case 1:
        this.indicarParaPauta();
        break;
      case 2:
        this.informarQuestionamentos();
        break;
      case 3:
        this.criarLote();
        break;
      case 4:
        this.sortear();
        break;
      case 5:
        this.acessarLocalizacao();
        break;
      case 7:
        this.efetivarDocumentos();
        break;
      case 8:
        this.assinarEmLote();
        break;
      case 9:
        this.apurarGrau();
        break;
      case 10:
        this.informarProvidencia();
        break;
      case 11:
        this.anexarEmLote();
        break;
      case 12:
        this.informarAlterarTipoSubTipo();
        break;
      case 13:
        this.classificarActProcesso();
        break;
      case 14:
        this.responderFichaQuesitos();
        break;
      case 15:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.INDICAR_PARA_PAUTA
        );
        break;
      case 16:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.RETIRAR_INDICACAO_PAUTA
        );
        break;
      case 17:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.MANTER_EMENTA
        );
        break;
      case 18:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.MANTER_QUESTIONAMENTO
        );
        break;
      case 20:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.INFORMAR_RESULTADO_EXAME_ADMISSIBILIDADE
        );
        break;
      case 21:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.RETIRAR_RELATOR_PROCESSO
        );
        break;
      case 22:
        this.arquivarProcesso();
        break;
      case 23:
        this.associarFatorDeAjusteDeHE();
        break;
      case 24:
        this.informarPalavraChaveProcesso();
        break;
      case 25:
        this.juntarDocumentos();
        break;
      case 26:
        this.solicitarCopiaIntegral();
        break;
      case 27:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.INFORMAR_DECISAO_MONOCRATICA
        );
        break;
      case 28:
        this.abrirFuncionalidadesJulgamento(
          funcionalidadeJulgamento.RETIFICAR_DECISAO_MONOCRATICA
        );
        break;
      case 29:
        this.openModalIncluirNota();
        break;
    }
  }

  obterProcessosSelecionados(/*apenasAvulsos: boolean*/): IProcessoApoio[] {
    var processosSelecionados: IProcessoApoio[] = [];
    this.atividadesProcessos.forEach((atividade) => {
      if (atividade.processos) {
        atividade.processos.forEach((processo) => {
          if (processo.data._selecionado) {
            processosSelecionados.push(processo.data);
          }
        });
      }
    });

    return processosSelecionados;
  }

  obterLotesSelecionados(): ILoteCaixaTrabalho[] {
    var lotesSelecionados: ILoteCaixaTrabalho[] = [];
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    processosSelecionados.forEach((processo) => {
      if (processo.dadosFixosProcesso.idLoteAtual) {
        var loteJaEncontrado = lotesSelecionados.some((lote) => {
          return processo.dadosFixosProcesso.idLoteAtual
            ? lote.id === processo.dadosFixosProcesso.idLoteAtual
            : false;
        });

        if (!loteJaEncontrado) {
          lotesSelecionados.push({
            id: processo.dadosFixosProcesso.idLoteAtual,
            nome: processo.dadosFixosProcesso.nomeLote,
          });
        }
      }
    });

    return lotesSelecionados;
  }

  obterProcessosSelecionadosComoString(
    processosSelecionados: IProcessoApoio[],
    opcoes?: {
      novoSeparador?: string;
      incluirProcessoFormatado?: boolean;
      incluirApenasFormatados?: boolean;
    }
  ): string {
    var numerosProcessos: string = "";
    var separador: string = "|";

    if (opcoes && opcoes.novoSeparador) {
      separador = opcoes.novoSeparador;
    }

    processosSelecionados.forEach((processo: IProcessoApoio, index: number) => {
      if (index > 0) {
        numerosProcessos += separador;
      }

      if (opcoes && opcoes.incluirApenasFormatados) {
        numerosProcessos += processo.dadosFixosProcesso.numeroProcessoFormatado;
      } else {
        numerosProcessos += processo.dadosFixosProcesso.numeroProcesso;

        if (opcoes && opcoes.incluirProcessoFormatado) {
          numerosProcessos +=
            "@" + processo.dadosFixosProcesso.numeroProcessoFormatado;
        }
      }
    });

    return numerosProcessos;
  }

  obterLotesSelecionadosComoString(
    lotesSelecionados: ILoteCaixaTrabalho[],
    apenasId?: boolean
  ): string {
    var lotesProcessos: string = "";

    lotesSelecionados.forEach((lote: ILoteCaixaTrabalho, index: number) => {
      if (index > 0) {
        lotesProcessos += "||";
      }

      lotesProcessos += lote.id + (apenasId ? "" : "|" + lote.nome + "|D");
    });

    return lotesProcessos;
  }

  acessarLocalizacao() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (
      this.validador.excedeuLimiteSelecaoProcesso(processosSelecionados, 1) ||
      this.validador.usuarioNaoResponsavel(processosSelecionados)
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numeroProcesso =
      processosSelecionados[0].dadosFixosProcesso.numeroProcesso;
    var numeroProcessoFormatado =
      processosSelecionados[0].dadosFixosProcesso.numeroProcessoFormatado;
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var url =
      "../ControleManterLocalizacaoProcessoFisico.asp?psAcao=exibir" +
      "&psNumeroProcesso=" +
      numeroProcesso +
      "&psNumeroEquipeAtividade=" +
      numeroEquipeAtividade +
      "&psOrigem=caixaDeTrabalho" +
      "&psNumeroProcessoFormatado=" +
      numeroProcessoFormatado;
    (<any>window).openDialog(
      url,
      700,
      350,
      true,
      ", toolbar=0, resizable=0, scrollbars=yes"
    );

    this.verificarFechamentoPopup();
  }

  apurarGrau() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (this.validador.excedeuLimiteSelecaoProcesso(processosSelecionados, 1)) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numeroProcesso =
      processosSelecionados[0].dadosFixosProcesso.numeroProcesso;
    var numeroProcessoFormatado =
      processosSelecionados[0].dadosFixosProcesso.numeroProcessoFormatado;
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var url =
      "../grau/ControleApurarGrau.asp?psAcao=exibir&psNumeroProcesso=" +
      numeroProcesso +
      "&psProcesso=" +
      numeroProcesso +
      "&psNumeroEquipeAtividade=" +
      numeroEquipeAtividade +
      "&psEscopoNota=NE" +
      "&psNumeroProcessoFormatado=" +
      numeroProcessoFormatado;
    (<any>window).openDialog(url, 850, 550, false, false, 200, 250);

    this.verificarFechamentoPopup();
  }

  arquivarProcesso() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (this.validador.atividadesDistintasSelecionadas(processosSelecionados)) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );

    this.popupService.abrirPopupArquivar(numerosProcessos);
  }

  informarPalavraChaveProcesso() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );
    this.popupService.abrirPopupAtualizaPalavraChaveProcesso(
      numerosProcessos,
      true
    );
  }

  solicitarCopiaIntegral() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          possuiMotivoSigilo:
            processo.dadosFixosProcesso.motivoSigiloProcesso &&
            processo.dadosFixosProcesso.motivoSigiloProcesso.trim()
              ? true
              : false,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );
    this.popupService.abrirPopupSolicitarCopiaIntegral(numerosProcessos, true);
  }

  associarFatorDeAjusteDeHE() {
    if (this.validador.temPerfilAssociarFatorDeAjusteHE()) {
      this.mostrarMensagemAlerta();
      return;
    }
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );
    this.popupService.abrirPopupAssociarFatorDeAjusteHE(numerosProcessos, true);
  }

  juntarDocumentos() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );

    this.popupService.abrirPopupJuntarDocumentos(numerosProcessos);
  }

  juntarDocumentosProvidencia() {
    var processosSelecionados: IProvidenciaCaixaTrabalho[] =
      this.obterProvidenciasSelecionadas();
    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.numeroProcesso,
          emLote: processo.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado: processo.numeroProcessoFormatado,
          sigiloso: processo.indicadorProcessoSigiloso,
          ehDossie: processo.ehDossie,
          nomeNivelSigiloInterno: processo.nomeNivelSigiloInterno,
        };
      }
    );

    this.popupService.abrirPopupJuntarDocumentos(numerosProcessos);
  }

  efetivarDocumentos() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );

    this.popupService.abrirPopupEfetivarDocumentos(numerosProcessos);
  }

  efetivarDocumentosProvidencia() {
    var processosSelecionados: IProvidenciaCaixaTrabalho[] =
      this.obterProvidenciasSelecionadas();

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.numeroProcesso,
          emLote: processo.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado: processo.numeroProcessoFormatado,
          sigiloso: processo.indicadorProcessoSigiloso,
          ehDossie: processo.ehDossie,
          nomeNivelSigiloInterno: processo.nomeNivelSigiloInterno,
        };
      }
    );

    this.popupService.abrirPopupEfetivarDocumentos(numerosProcessos);
  }

  assinarEmLote() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );

    this.popupService.abrirPopupDocumentosPendenciaAssinatura(numerosProcessos);
  }

  classificarActProcesso() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var processosSelecionadosAvulsos = processosSelecionados.filter(
      (processo) => {
        //Apenas processos que não estejam em lote
        return !processo.dadosFixosProcesso.idLoteAtual;
      }
    );
    var lotesSelecionados: ILoteCaixaTrabalho[] = this.obterLotesSelecionados();

    var numerosProcessos: string = this.obterProcessosSelecionadosComoString(
      processosSelecionadosAvulsos
    );
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var chaveEquipe = this.obterNumeroEquipe(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var cpfUsuarioAtual = this.usuarioLogadoService.gerarCPFComDV(
      this.usuarioLogado.cpfUsuarioSemDV.toString(),
      false
    );
    var numerosLotes = this.obterLotesSelecionadosComoString(lotesSelecionados);

    //Funcao para obter array de processos no formado NUMEROPROC|NATUREZA|SIGILO
    var obterNumerosComNaturezaESigilo = (
      processosSelecionados: IProcessoApoio[]
    ): string => {
      var numerosProcessos: string = "";

      processosSelecionados.forEach(
        (processo: IProcessoApoio, index: number) => {
          if (index > 0) {
            numerosProcessos += "||";
          }

          numerosProcessos +=
            processo.dadosFixosProcesso.numeroProcesso +
            "|D|" +
            (processo.dadosFixosProcesso.indicadorProcessoSigiloso
              ? "S"
              : "N") +
            "|" +
            processo.dadosFixosProcesso.numeroProcessoFormatado +
            "|" +
            (processo.dadosFixosProcesso.indicadorDossie ? "S" : "N") +
            "|" +
            processo.dadosFixosProcesso.nomeNivelSigiloInterno;
        }
      );

      return numerosProcessos;
    };

    var numerosProcessosComNaturezaESigilo: string =
      obterNumerosComNaturezaESigilo(processosSelecionadosAvulsos);

    //Validações feitas pelo VB
    this.caixaTrabalhoService
      .verificarParaClassificarACT(
        chaveEquipe,
        numeroEquipeAtividade,
        cpfUsuarioAtual,
        numerosLotes,
        numerosProcessos
      )
      .subscribe((data) => {
        if (data && data.erro) {
          this.mostrarMensagemAlerta(data.erro);
        } else {
          this.popupService.abrirPopupClassificarActProcesso(
            numeroEquipeAtividade,
            numerosLotes,
            numerosProcessosComNaturezaESigilo,
            "N"
          );
        }
      });
  }

  criarLote() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    this.validador.setAgruparPorAtividade(this.agrupadoPorAtividade);

    if (
      !this.validador.processoAgrupadoPorAtividade() ||
      this.validador.existeProcessoSigilosoParaInclusaoEmLote(
        processosSelecionados
      ) ||
      this.validador.processoContidoEmLote(processosSelecionados) ||
      this.validador.atividadesDistintasSelecionadas(processosSelecionados)
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var nomeEquipe =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .siglaEquipe;
    var nomeAtividade =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .nomeAtividade;
    var processosSelecionadosString: string =
      this.obterProcessosSelecionadosComoString(processosSelecionados, {
        novoSeparador: "||",
        incluirProcessoFormatado: true,
      });

    this.popupService.abrirPopupIncluirProcessoEmLote(
      numeroEquipeAtividade,
      nomeEquipe,
      nomeAtividade,
      processosSelecionadosString
    );
  }

  informarQuestionamentos() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var processosSelecionadosAvulsos = processosSelecionados.filter(
      (processo) => {
        //Apenas processos que não estejam em lote
        return !processo.dadosFixosProcesso.idLoteAtual;
      }
    );
    var lotesSelecionados: ILoteCaixaTrabalho[] = this.obterLotesSelecionados();

    var numerosProcessos: string = this.obterProcessosSelecionadosComoString(
      processosSelecionadosAvulsos,
      { novoSeparador: "||" }
    );
    var numerosLotes = this.obterLotesSelecionadosComoString(
      lotesSelecionados,
      true
    );
    var chaveEquipe = this.obterNumeroEquipe(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );

    var url =
      "../grau/ControleInformarQuestionamento.asp?psAcao=exibirlote&psNumeroEquipe=" +
      chaveEquipe;
    var param = {
      psNumeroProcesso: numerosProcessos,
      psNumeroLote: numerosLotes,
    };

    var popup = (<any>window).abrirJanelaPassandoPost(
      url,
      "width=850,height=500,left=60,top=5,resizable=no,scrollbars=yes",
      "windowInfoQuestionamento",
      param
    );

    this.verificarFechamentoPopup(popup);
  }

  indicarParaPauta() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var processosSelecionadosAvulsos = processosSelecionados.filter(
      (processo) => {
        //Apenas processos que não estejam em lote
        return !processo.dadosFixosProcesso.idLoteAtual;
      }
    );
    var lotesSelecionados: ILoteCaixaTrabalho[] = this.obterLotesSelecionados();

    var numerosProcessos: string = this.obterProcessosSelecionadosComoString(
      processosSelecionadosAvulsos,
      { novoSeparador: "||", incluirApenasFormatados: true }
    );
    var numerosLotes = this.obterLotesSelecionadosComoString(
      lotesSelecionados,
      true
    );
    var chaveEquipe = this.obterNumeroEquipe(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );

    var url =
      "../pauta/ControleIndicarProcessoPauta.asp?psAcao=exibir&psNumeroProcesso=" +
      numerosProcessos +
      "&psNumeroLote=" +
      numerosLotes +
      "&psNumeroEquipe=" +
      chaveEquipe;
    (<any>window).openDialog(url, 850, 500, false, false);

    this.verificarFechamentoPopup();
  }

  informarAlterarTipoSubTipo() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (
      !this.validador.apenasProcessoOuDossieSelecionados(processosSelecionados)
    ) {
      this.modalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief.show();
      return;
    }

    var apenasDossieSelecionado: boolean = processosSelecionados.every(
      (processo) => {
        return processo.dadosFixosProcesso.indicadorDossie;
      }
    );

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      }
    );

    if (apenasDossieSelecionado) {
      this.popupService.abrirPopupManterSubtipoProcessoDossie(numerosProcessos);
    } else {
      this.popupService.abrirPopupManterSubtipoProcessoSief(numerosProcessos);
    }
  }

  alterarProcessosSief() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessosSief: IProcessoSelecionado[] = processosSelecionados
      .filter((processo) => {
        return !processo.dadosFixosProcesso.indicadorDossie;
      })
      .map((processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      });

    this.popupService.abrirPopupManterSubtipoProcessoSief(numerosProcessosSief);
    this.modalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief.hide();
  }

  alterarProcessosDossies() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessosDossie: IProcessoSelecionado[] = processosSelecionados
      .filter((processo) => {
        return processo.dadosFixosProcesso.indicadorDossie;
      })
      .map((processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
          sigiloso: processo.dadosFixosProcesso.indicadorProcessoSigiloso,
          ehDossie: processo.dadosFixosProcesso.indicadorDossie,
          nomeNivelSigiloInterno:
            processo.dadosFixosProcesso.nomeNivelSigiloInterno,
        };
      });

    this.popupService.abrirPopupManterSubtipoProcessoDossie(
      numerosProcessosDossie
    );
    this.modalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief.hide();
  }

  cancelarModalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief() {
    this.modalPerguntaAlteracaoTipoSubtipoProcessoDossieOuSief.hide();
    this.recarregarProcessos();
  }

  anexarEmLote() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (
      this.validador.atividadesDistintasSelecionadas(processosSelecionados) ||
      this.validador.usuarioNaoResponsavel(processosSelecionados) ||
      this.validador.nomeGrupoProcessoAdministrativoJudicialSigilo(
        processosSelecionados
      )
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    //Funcao para obter array de processos no formado NUMEROPROC|NOMECONTRIBUINTE
    var obterNumerosComNomeContribuinte = (
      processosSelecionados: IProcessoApoio[]
    ): string => {
      var numerosProcessos: string = "";

      processosSelecionados.forEach(
        (processo: IProcessoApoio, index: number) => {
          if (index > 0) {
            numerosProcessos += "||";
          }

          numerosProcessos +=
            processo.dadosFixosProcesso.numeroProcessoFormatado +
            "|" +
            (processo.dadosFixosProcesso.nomeContribuinte
              ? processo.dadosFixosProcesso.nomeContribuinte
              : "-");
        }
      );

      return numerosProcessos;
    };

    var numerosProcessosComNomeContribuinte: string =
      obterNumerosComNomeContribuinte(processosSelecionados);
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var nomeAtividade =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .nomeAtividade;

    var url =
      "../ControleAnexarLoteDocumento.asp?psAcao=apresentarpagina&psRelacaoProcessos=" +
      numerosProcessosComNomeContribuinte +
      "&psNumeroEquipeAtividade=" +
      numeroEquipeAtividade +
      "&psNomeAtividadeAtual=" +
      nomeAtividade;
    (<any>window).openDialogPOST(
      url,
      1180,
      710,
      true,
      "",
      "",
      "",
      "",
      "",
      "",
      true
    );
  }

  informarProvidencia() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var processosSelecionadosString: string =
      this.obterProcessosSelecionadosComoString(processosSelecionados, {
        novoSeparador: "||",
      });
    var resourceIdUnidade = this.equipeSelecionada.resourceIdUnidadeArvore;
    var idTipoUnidade = this.equipeSelecionada.idTipoUnidade;
    this.popupService.abrirPopupInformarProvidencia(
      resourceIdUnidade,
      processosSelecionadosString,
      this.router.url,
      idTipoUnidade,
      TelaOrigemEnum.CAIXA_TRABALHO
    );
  }

  responderFichaQuesitos() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var processosSelecionadosAvulsos = processosSelecionados.filter(
      (processo) => {
        //Apenas processos que não estejam em lote
        return !processo.dadosFixosProcesso.idLoteAtual;
      }
    );
    var lotesSelecionados: ILoteCaixaTrabalho[] = this.obterLotesSelecionados();

    var numerosProcessos: string = this.obterProcessosSelecionadosComoString(
      processosSelecionadosAvulsos
    );
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var chaveEquipe = this.obterNumeroEquipe(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var cpfUsuarioAtual = this.usuarioLogadoService.gerarCPFComDV(
      this.usuarioLogado.cpfUsuarioSemDV.toString(),
      false
    );
    var numerosLotes = this.obterLotesSelecionadosComoString(lotesSelecionados);

    //Funcao para obter array de processos no formado NUMEROPROC|NATUREZA|SIGILO
    var obterNumerosComNaturezaESigilo = (
      processosSelecionados: IProcessoApoio[]
    ): string => {
      var numerosProcessos: string = "";

      processosSelecionados.forEach(
        (processo: IProcessoApoio, index: number) => {
          if (index > 0) {
            numerosProcessos += "||";
          }

          numerosProcessos +=
            processo.dadosFixosProcesso.numeroProcessoFormatado +
            "|D|" +
            (processo.dadosFixosProcesso.indicadorProcessoSigiloso
              ? "S"
              : "N") +
            "|" +
            (processo.dadosFixosProcesso.indicadorDossie ? "S" : "N") +
            "|" +
            processo.dadosFixosProcesso.nomeNivelSigiloInterno;
        }
      );

      return numerosProcessos;
    };

    var numerosProcessosComNaturezaESigilo: string =
      obterNumerosComNaturezaESigilo(processosSelecionados);

    //Validações feitas pelo VB
    this.caixaTrabalhoService
      .verificarParaResponderFichaQuesitos(
        chaveEquipe,
        numeroEquipeAtividade,
        cpfUsuarioAtual,
        numerosLotes,
        numerosProcessos
      )
      .subscribe((data) => {
        if (data && data.erro) {
          this.mostrarMensagemAlerta(data.erro);
        } else {
          this.popupService.abrirPopupResponderFichaQuesitos(
            numeroEquipeAtividade,
            numerosLotes,
            numerosProcessosComNaturezaESigilo
          );
        }
      });
  }

  sortear() {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    var processosSelecionadosAvulsos = processosSelecionados.filter(
      (processo) => {
        //Apenas processos que não estejam em lote
        return !processo.dadosFixosProcesso.idLoteAtual;
      }
    );
    var lotesSelecionados: ILoteCaixaTrabalho[] = this.obterLotesSelecionados();

    if (
      !this.validador.usuarioPermissaoProcesso(processosSelecionados) ||
      this.validador.atividadesDistintasSelecionadas(processosSelecionados) ||
      this.validador.existeProcessoSigilosoParaSorteio(processosSelecionados)
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var nomeEquipe =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .siglaEquipe;
    var nomeAtividade =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .nomeAtividade;
    var numerosLotes = this.obterLotesSelecionadosComoString(lotesSelecionados);

    //Funcao para obter array de processos no formado NUMEROPROC|NATUREZA|SIGILO
    var obterNumerosComNatureza = (
      processosSelecionados: IProcessoApoio[]
    ): string => {
      var numerosProcessos: string = "";

      processosSelecionados.forEach(
        (processo: IProcessoApoio, index: number) => {
          if (index > 0) {
            numerosProcessos += "||";
          }

          numerosProcessos +=
            processo.dadosFixosProcesso.numeroProcesso +
            "|" +
            processo.dadosFixosProcesso.numeroProcessoFormatado +
            "|D" +
            "|" +
            (processo.dadosFixosProcesso.indicadorProcessoSigiloso
              ? "S"
              : "N") +
            "|" +
            (processo.dadosFixosProcesso.indicadorDossie ? "S" : "N") +
            "|" +
            processo.dadosFixosProcesso.nomeNivelSigiloInterno;
        }
      );

      return numerosProcessos;
    };

    var numerosProcessosComNatureza: string = obterNumerosComNatureza(
      processosSelecionadosAvulsos
    );

    this.popupService.abrirPopupSorteio(
      numeroEquipeAtividade,
      nomeEquipe,
      nomeAtividade,
      numerosLotes,
      numerosProcessosComNatureza
    );
  }

  abrirFuncionalidadesJulgamento(funcionalidade: funcionalidadeJulgamento) {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    var numerosProcessos: IProcessoSelecionado[] = processosSelecionados.map(
      (processo) => {
        var cpfResponsavel = processo.dadosFixosProcesso.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              processo.dadosFixosProcesso.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: processo.dadosFixosProcesso.numeroProcesso,
          emLote: processo.dadosFixosProcesso.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado:
            processo.dadosFixosProcesso.numeroProcessoFormatado,
        };
      }
    );

    switch (funcionalidade) {
      case funcionalidadeJulgamento.INDICAR_PARA_PAUTA:
        this.popupService.abrirPopupIndicarParaPauta(numerosProcessos);
        break;
      case funcionalidadeJulgamento.RETIRAR_INDICACAO_PAUTA:
        this.popupService.abrirPopupRetirarIndicaoParaPauta(numerosProcessos);
        break;
      case funcionalidadeJulgamento.MANTER_EMENTA:
        this.popupService.abrirPopupManterEmenta(numerosProcessos);
        break;
      case funcionalidadeJulgamento.MANTER_QUESTIONAMENTO:
        this.popupService.abrirPopupManterQuestionamento(numerosProcessos);
        break;
      case funcionalidadeJulgamento.INFORMAR_RESULTADO_EXAME_ADMISSIBILIDADE:
        this.popupService.abrirPopupInformarResultadoExameAdmissibilidade(
          numerosProcessos
        );
        break;
      case funcionalidadeJulgamento.INFORMAR_RESULTADO_EXAME_ADMISSIBILIDADE:
        this.popupService.abrirPopupInformarResultadoExameAdmissibilidade(
          numerosProcessos
        );
        break;
      case funcionalidadeJulgamento.RETIRAR_RELATOR_PROCESSO:
        this.popupService.abrirPopupRetirarRelatorProcesso(numerosProcessos);
        break;
      case funcionalidadeJulgamento.INFORMAR_DECISAO_MONOCRATICA:
        this.popupService.abrirPopupInformarDecisaoMonocratica(
          numerosProcessos
        );
        break;
      case funcionalidadeJulgamento.RETIFICAR_DECISAO_MONOCRATICA:
        this.popupService.abrirPopupRetiticarDecisaoMonocratica(
          numerosProcessos
        );
        break;
    }
  }

  openModalIncluirNota(): void {
    this.processosSelecionados = this.obterProcessosSelecionados();
    this.modalIncluirNota.show();
  }

  incluirNota(novaNota: INota) {
    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();
    processosSelecionados.forEach((processo) => {
      this.notaIncluir.numerosProcessos.push(
        processo.dadosFixosProcesso.numeroProcesso
      );
    });
    this.notaIncluir.texto = novaNota.textoNota;
    this.notaIncluir.destinatarioNota = novaNota.destinatarioNota;
    this.notasService.incluirNota(this.notaIncluir).subscribe();
    novaNota.textoNota = "";
    this.notaIncluir.numerosProcessos = [];
    this.modalIncluirNota.hide();
    this.recarregarProcessos();
  }

  atualizarEquipeAtividadeProcesso(
    processosSelecionados: IProcessoApoio[]
  ): any {
    var mapEquipesAtividadesRepresentadas: {
      equipeAtividade: IEquipeAtividade;
      processos: IProcessoApoio[];
    }[] = [];

    processosSelecionados.forEach((processo) => {
      var equipeAtividadeRepresentada = mapEquipesAtividadesRepresentadas.find(
        (item) =>
          item.equipeAtividade.resourceId ===
          processo.dadosFixosProcesso.equipeAtividadeAtual.resourceId
      );

      if (!equipeAtividadeRepresentada) {
        mapEquipesAtividadesRepresentadas.push({
          equipeAtividade: processo.dadosFixosProcesso.equipeAtividadeAtual,
          processos: [processo],
        });
      } else {
        equipeAtividadeRepresentada.processos.push(processo);
      }
    });

    var observables = mapEquipesAtividadesRepresentadas.map((item) => {
      return this.equipeAtividadeService
        .obterPorId(item.equipeAtividade.resourceId)
        .do((data) => {
          if (data) {
            item.processos.forEach((processo) => {
              processo.dadosFixosProcesso.equipeAtividadeAtual = data;
            });
          }
        });
    });

    return observables;
  }

  autoDistribuir() {
    this.apagarMensagens();

    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (!this.validador.existeProcessoSelecionado(processosSelecionados)) {
      this.mostrarMensagemAlerta();
      return;
    }

    let observables = this.atualizarEquipeAtividadeProcesso(
      processosSelecionados
    );

    Observable.forkJoin(observables).subscribe(() => {
      if (
        this.validador.existeProcessoApensado(processosSelecionados) ||
        this.validador.existeProcessoDistribuido(processosSelecionados) ||
        !this.validador.atividadePermiteDistribuicao(processosSelecionados)
      ) {
        this.mostrarMensagemAlerta();
        return;
      }

      var cpfUsuarioAtual = this.usuarioLogadoService.gerarCPFComDV(
        this.usuarioLogado.cpfUsuarioSemDV.toString(),
        false
      );
      var informacoesProcessos = this.obterInformacoesProcessosLotes(
        processosSelecionados
      );
      var chaveEquipe = this.obterNumeroEquipe(
        processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
      );

      //Disponibiliza dos dados para distribuição em atributo da tela pai
      (<any>window).dadosAutoDistribuicao = {
        cpfUsuarioAtual: cpfUsuarioAtual,
        informacoesProcessos: informacoesProcessos,
        chaveEquipe: chaveEquipe,
      };

      //Cria função na tela pai para exibição de mensagem de sucesso
      (<any>window).fnCallbackRetornoPopupAutoDistribuicao = () => {
        (<any>window).dadosAutoDistribuicao = undefined;
        this.mostrarMensagemSucesso(`Processos distribuídos com sucesso.`);
      };

      var url = "../ControleAutoDistribuir.asp?psAcao=apresentarPagina";
      (<any>window).openDialog(
        url,
        350,
        250,
        "",
        "",
        "",
        150,
        "",
        "",
        "",
        false
      );

      this.verificarFechamentoPopup();
    });
  }

  obterURLParametrosLiberarDistribuirRedistribuir(
    tipo: tipoDistribuicao,
    processosSelecionados: IProcessoApoio[]
  ): { url: string; param: { psDadosProcesso: string } } {
    var supervisor = this.validador.getUsuarioSupervisor() ? "S" : "N";
    var chaveEquipe = this.obterNumeroEquipe(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var variasAtividades = this.agrupadoPorAtividade
      ? this.validador.atividadesDistintasSelecionadas(processosSelecionados)
      : false;
    var cpfUsuarioAtual = this.usuarioLogadoService.gerarCPFComDV(
      this.usuarioLogado.cpfUsuarioSemDV.toString(),
      false
    );
    var chavesAtividades = this.agrupadoPorAtividade
      ? this.retiraChaveAtividadeRepetida(
          processosSelecionados
            .map((processo) => {
              return processo.dadosFixosProcesso.equipeAtividadeAtual
                .idAtividade;
            })
            .join("|")
        )
      : "99999";

    var operacao;
    switch (tipo) {
      case tipoDistribuicao.DISTRIBUIR:
        operacao = "Distribuir";
        break;
      case tipoDistribuicao.REDISTRIBUIR:
        operacao = "Redistribuir";
        break;
      case tipoDistribuicao.LIBERAR:
        operacao = "Liberar";
        break;
    }

    var url =
      "../ControleLiberarDistribuirRedistribuir.asp?psAcao=exibir" +
      "&psOperacao=" +
      operacao +
      "&psSupervisor=" +
      supervisor +
      "&psNumeroEquipe=" +
      chaveEquipe +
      "&pbVariasAtividades=" +
      variasAtividades +
      "&psCPFUsuarioAtual=" +
      cpfUsuarioAtual +
      "&psChaveAtividade=" +
      chavesAtividades;

    if (
      tipo === tipoDistribuicao.DISTRIBUIR ||
      tipo === tipoDistribuicao.REDISTRIBUIR
    ) {
      var permiteDistribuicao = this.validador.atividadeNaoPermiteDistribuicao(
        processosSelecionados
      )
        ? "N"
        : "S";
      url += "&psDistribuir=" + permiteDistribuicao;
    }

    if (
      tipo === tipoDistribuicao.REDISTRIBUIR ||
      tipo === tipoDistribuicao.LIBERAR
    ) {
      var cpfResponsaveis = Array.from(
        new Set(
          processosSelecionados.map((processo) => {
            return processo.dadosFixosProcesso.cpfResponsavelAtual;
          })
        )
      );

      var CPFResponsavel =
        cpfResponsaveis.length === 1 ? cpfResponsaveis[0] : "";

      url += "&psCPFResponsavel=" + CPFResponsavel;
      url += "&pbPossuiResponsaveisIguais=" + (cpfResponsaveis.length === 1);
    }

    if (tipo === tipoDistribuicao.REDISTRIBUIR) {
      url += "&psVisualizarProc=N";
    }

    var informacoesProcessos = this.obterInformacoesProcessosLotes(
      processosSelecionados
    );

    var param = { psDadosProcesso: informacoesProcessos };

    return { url: url, param: param };
  }

  obterInformacoesProcessosLotes(processosSelecionados: IProcessoApoio[]) {
    return Array.from(
      new Set(
        processosSelecionados.map((processo) => {
          var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
            processo.dadosFixosProcesso.equipeAtividadeAtual
          );
          if (processo.dadosFixosProcesso.idLoteAtual) {
            return `L@${processo.dadosFixosProcesso.idLoteAtual}@${numeroEquipeAtividade}`;
          } else {
            return `P@${processo.dadosFixosProcesso.numeroProcesso}@${numeroEquipeAtividade}`;
          }
        })
      )
    ).join("||");
  }

  distribuir() {
    this.apagarMensagens();

    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (!this.validador.existeProcessoSelecionado(processosSelecionados)) {
      this.mostrarMensagemAlerta();
      return;
    }

    let observables = this.atualizarEquipeAtividadeProcesso(
      processosSelecionados
    );

    Observable.forkJoin(observables).subscribe(() => {
      if (
        this.validador.existeProcessoApensado(processosSelecionados) ||
        this.validador.existeProcessoDistribuido(processosSelecionados) ||
        !this.validador.atividadePermiteDistribuicao(processosSelecionados)
      ) {
        this.mostrarMensagemAlerta();
        return;
      }

      var dadosRequisicao =
        this.obterURLParametrosLiberarDistribuirRedistribuir(
          tipoDistribuicao.DISTRIBUIR,
          processosSelecionados
        );

      var popup = (<any>window).abrirJanelaPassandoPost(
        dadosRequisicao.url,
        "width=500,height=250,left=390,top=270,resizable=no,scrollbars=no",
        "windowDistribuit",
        dadosRequisicao.param
      );

      this.verificarFechamentoPopup(popup);
    });
  }

  redistribuir() {
    this.apagarMensagens();

    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (!this.validador.existeProcessoSelecionado(processosSelecionados)) {
      this.mostrarMensagemAlerta();
      return;
    }

    let observables = this.atualizarEquipeAtividadeProcesso(
      processosSelecionados
    );

    Observable.forkJoin(observables).subscribe(() => {
      if (
        this.validador.existeProcessoApensado(processosSelecionados) ||
        this.validador.existeProcessoNaoDistribuido(processosSelecionados) ||
        !this.validador.atividadePermiteDistribuicaoDeProcessoNaoSigiloso(
          processosSelecionados
        ) ||
        !this.validador.usuarioPermissaoProcessoSigilo(processosSelecionados)
      ) {
        this.mostrarMensagemAlerta();
        return;
      }

      var dadosRequisicao =
        this.obterURLParametrosLiberarDistribuirRedistribuir(
          tipoDistribuicao.REDISTRIBUIR,
          processosSelecionados
        );

      var popup = (<any>window).abrirJanelaPassandoPost(
        dadosRequisicao.url,
        "width=550,height=500,left=390,top=150,resizable=no,scrollbars=no",
        "windowRedistribuir",
        dadosRequisicao.param
      );

      this.verificarFechamentoPopup(popup);
    });
  }

  liberar() {
    this.apagarMensagens();

    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (!this.validador.existeProcessoSelecionado(processosSelecionados)) {
      this.mostrarMensagemAlerta();
      return;
    }

    let observables = this.atualizarEquipeAtividadeProcesso(
      processosSelecionados
    );

    Observable.forkJoin(observables).subscribe(() => {
      if (
        this.validador.existeProcessoApensado(processosSelecionados) ||
        this.validador.existeProcessoNaoDistribuido(processosSelecionados) ||
        !this.validador.usuarioPermissaoProcesso(processosSelecionados) ||
        this.validador.existeProcessoSigilosoParaLiberacao(
          processosSelecionados
        )
      ) {
        this.mostrarMensagemAlerta();
        return;
      }

      var dadosRequisicao =
        this.obterURLParametrosLiberarDistribuirRedistribuir(
          tipoDistribuicao.LIBERAR,
          processosSelecionados
        );

      var popup = (<any>window).abrirJanelaPassandoPost(
        dadosRequisicao.url,
        "width=550,height=500,left=390,top=220,resizable=no,scrollbars=no",
        "windowLiberar",
        dadosRequisicao.param
      );

      this.verificarFechamentoPopup(popup);
    });
  }

  movimentar() {
    this.apagarMensagens();

    var processosSelecionados: IProcessoApoio[] =
      this.obterProcessosSelecionados();

    if (
      !this.validador.existeProcessoSelecionado(processosSelecionados) ||
      this.validador.existeProcessoApensado(processosSelecionados) ||
      !this.validador.usuarioPermissaoProcesso(processosSelecionados) ||
      this.validador.excedeuLimiteSelecaoProcesso(processosSelecionados, 50) ||
      this.validador.atividadesDistintasSelecionadas(processosSelecionados)
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numerosProcessos: string = this.obterProcessosSelecionadosComoString(
      processosSelecionados.filter((processo) => {
        //Apenas processos que não estejam em lote
        return !processo.dadosFixosProcesso.idLoteAtual;
      }),
      { novoSeparador: "||" }
    );
    var numerosProcessosFormatados: string =
      this.obterProcessosSelecionadosComoString(
        processosSelecionados.filter((processo) => {
          //Apenas processos que não estejam em lote
          return !processo.dadosFixosProcesso.idLoteAtual;
        }),
        { novoSeparador: "||", incluirApenasFormatados: true }
      );
    var lotesSelecionados: ILoteCaixaTrabalho[] = this.obterLotesSelecionados();
    var numerosLotes: string = this.obterLotesSelecionadosComoString(
      lotesSelecionados,
      true
    );
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
    );
    var nomeEquipe =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .siglaEquipe;
    var nomeAtividade =
      processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual
        .nomeAtividade;

    var cpfResponsaveis = Array.from(
      new Set(
        processosSelecionados.map((processo) => {
          return processo.dadosFixosProcesso.cpfResponsavelAtual;
        })
      )
    );

    var CPFResponsavel: string;
    var possuiResponsaveisIguais: boolean;

    if (cpfResponsaveis.length === 1 && cpfResponsaveis[0]) {
      CPFResponsavel = cpfResponsaveis[0];
      possuiResponsaveisIguais = true;
    } else {
      CPFResponsavel = "";
      possuiResponsaveisIguais = false;
    }

    var url =
      "../ControleMovimentarProcesso.asp?psAcao=apresentarPagina" +
      "&psNumeroEquipeAtividadeAtual=" +
      numeroEquipeAtividade +
      "&psNomeEquipeAtual=" +
      nomeEquipe +
      "&psNomeAtividadeAtual=" +
      nomeAtividade +
      "&pbPossuiResponsaveisIguais=" +
      possuiResponsaveisIguais +
      "&psCPFResponsavel=" +
      CPFResponsavel +
      "&psNovaCaixaTrabalho=1";

    var param = {
      psNumeroProcesso: numerosProcessos,
      psNumeroLote: numerosLotes,
      psNumeroProcessoFormatado: numerosProcessosFormatados,
    };

    var popup = (<any>window).abrirJanelaPassandoPost(
      url,
      "width=1300,height=650,left='',top=50,resizable=yes,scrollbars=''",
      "windowMovimentar",
      param
    );

    this.verificarFechamentoPopup(popup);
  }

  obterNumeroEquipeAtividade(equipeAtividade: IEquipeAtividade) {
    var numeroEquipeAtividade =
      equipeAtividade.id +
      "|" +
      equipeAtividade.idEquipe +
      "|" +
      equipeAtividade.idTipoUnidade +
      "|1|" +
      equipeAtividade.idAtividade;
    return numeroEquipeAtividade;
  }

  obterNumeroEquipe(equipeAtividade: IEquipeAtividade) {
    var numeroEquipe =
      equipeAtividade.idEquipe + "|" + equipeAtividade.idTipoUnidade + "|1";
    return numeroEquipe;
  }

  apagarMensagens() {
    this.mensagensHandler.handleClearMessages();
  }

  mostrarMensagemSucesso(mensagem: string) {
    this.mensagensHandler.handleSuccess(mensagem);
  }

  mostrarMensagemAlerta(mensagem?: string | string[]) {
    var mensagensAlertas: ApplicationErrorMessage[] = [];
    if (!mensagem) {
      mensagensAlertas.push({
        uid: "0",
        description: this.validador.getMensagemAlerta(),
      });
    } else {
      if (mensagem instanceof Array) {
        mensagem.forEach((msg) => {
          mensagensAlertas.push({ uid: "0", description: msg });
        });
      } else {
        mensagensAlertas.push({ uid: "0", description: mensagem });
      }
    }
    this.mensagensHandler.handleError(mensagensAlertas);
  }

  mostrarMensagemHttp(resposta: Response) {
    this.mensagensHandler.handleHttpError(resposta);
  }

  mostrarModalAlterarRelator() {
    this.modalAlterarRelator.show();
  }

  get multiplasMensagens(): boolean {
    return Array.isArray(this.mensagemAlerta);
  }

  get caixaTrabalhoUsuario(): boolean {
    return this.tipoCaixaTrabalho === TipoCaixaTrabalhoEnum.USUARIO;
  }

  get linkCaixaAntiga(): string {
    if (this.caixaTrabalhoUsuario) {
      return "../ControleAcessarCaixaTrabalho.asp?psAcao=apresentarPagina&cpfUsuario=1&psLimpaEquipe=1";
    } else {
      return "../ControleAcessarCaixaTrabalho.asp?psAcao=apresentarPagina&psLimpaEquipe=1";
    }
  }

  //Recebe uma string com as chaves das atividades que foram realizadas operações. Caso tenha alguma atividade repetida,
  //retira da string. Formato da string: Chave Atividade|Chave Atividade|Chave Atividade
  retiraChaveAtividadeRepetida(psChaveAtividade) {
    var laChaveAtividade = psChaveAtividade.split("|");
    var lsChaveAtividade = "";

    for (var i = 0; i < laChaveAtividade.length; i++) {
      if (i == 0 || laChaveAtividade[i] != laChaveAtividade[i - 1]) {
        lsChaveAtividade += laChaveAtividade[i] + "|";
      }
    }

    lsChaveAtividade = lsChaveAtividade.substring(
      0,
      lsChaveAtividade.length - 1
    );

    return lsChaveAtividade;
  }

  processosHEChange(
    processosSelecionadosHE: IProcessoApoio[]
  ): EProcessoGridDataSelect[] {
    this._modalHorasEstimadas.totalizador.minutosEstimadosSelecionados = 0;
    this._modalHorasEstimadas.totalizador.numeroProcessosSelecionados = 0;

    processosSelecionadosHE.forEach((processoSelecionado) => {
      this._modalHorasEstimadas.totalizador.numeroProcessosSelecionados++;
      this._modalHorasEstimadas.totalizador.addHorasEstimadasSelecionados(
        (<any>processoSelecionado).qtdHorasEstimadas
      );
    });

    let dataSelect: EProcessoGridDataSelect[] = [];
    this._modalHorasEstimadas.processos.forEach((p) => {
      p.selected = processosSelecionadosHE.includes(p.data);

      dataSelect.push({
        valor: p.data.dadosFixosProcesso.numeroProcessoFormatado,
        atributo: "dadosFixosProcesso.numeroProcessoFormatado",
        selected: p.selected,
      });
    });
    return dataSelect;
  }

  calcularTotalizadores(
    atividadeProcessos: AtividadeProcessos,
    ehProvidencia?: boolean
  ) {
    if (ehProvidencia) {
      this.ehAtividadeProvidencia = true;
    } else {
      this.ehAtividadeProvidencia = false;
    }

    let caixaTrabalho: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : null,
      resourceIdAtividade: atividadeProcessos.atividade.resourceId,
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: this.exibirApensados,
      atividadeProvidencia:
        ehProvidencia && atividadeProcessos.atividade.id != 0,
    };

    if (ehProvidencia) {
      this.caixaTrabalhoService
        .obterTotalizadoresProvidencia(caixaTrabalho)
        .subscribe((totalizador) => {
          atividadeProcessos.totalizador.ehProvidencia = true;
          atividadeProcessos.totalizador.numeroProcessosTotal =
            totalizador.numeroTotalProcessos;
          atividadeProcessos.totalizador.setHorasEstimadasTotal(
            totalizador.horasEstimadas
          );
          atividadeProcessos.totalizador.visible = true;
        });
    } else {
      this.caixaTrabalhoService
        .obterTotalizadores(caixaTrabalho)
        .subscribe((totalizador) => {
          atividadeProcessos.totalizador.ehProvidencia = false;
          atividadeProcessos.totalizador.numeroProcessosTotal =
            totalizador.numeroTotalProcessos;
          atividadeProcessos.totalizador.setHorasEstimadasTotal(
            totalizador.horasEstimadas
          );
          atividadeProcessos.totalizador.visible = true;
        });
    }
  }
  reduzirTotalizadores(atividadeProcessos: AtividadeProcessos) {
    atividadeProcessos.totalizador.visible = false;
  }

  calcularMaxHeightTableHorasEstimadas(): string {
    let maxHeight: number;
    let modalHorasEstimadas = $(".modal-horas-estimadas-full-width")[0];
    if (modalHorasEstimadas) {
      let heightContent = modalHorasEstimadas.parentElement.clientHeight; //Área útil disponível
      let offsetIE = 1; //para não criar barra de rolagem quando, na prática, não há overflow
      maxHeight = heightContent - 257 - offsetIE;
      return maxHeight.toString().concat("px");
    }
  }

  atualizarProcessos(
    atividadeProcessos: AtividadeProcessos,
    reduzirTotalizadores: boolean = true,
    ehProvidencia?: boolean
  ) {
    if (reduzirTotalizadores) {
      this.reduzirTotalizadores(atividadeProcessos);
    }

    if (!atividadeProcessos.ultimoFetchDataEvent) {
      var colunaNumeroProcesso;

      if (!this.atividadeQueryJaCarregada) {
        if(atividadeProcessos.config) {
          colunaNumeroProcesso = atividadeProcessos.config.colunas.find(
            (coluna) => {
              return (
                coluna.atributo === "numeroProcesso" && (<any>coluna.filtro).texto
              );
            }
          );
        }
        atividadeProcessos.filtering = colunaNumeroProcesso ? true : false;
      }

      atividadeProcessos.ultimoFetchDataEvent = {
        page: 1,
        itemsPerPage: 50,
        columnsToSortBy: [],
        columnsToFilterBy: colunaNumeroProcesso ? [colunaNumeroProcesso] : [],
      };
    }
    this.obterProcessosDaAtividade(
      atividadeProcessos,
      atividadeProcessos.ultimoFetchDataEvent,
      ehProvidencia
    );
  }

  obterProcessosDaAtividade(
    atividadeProcessos: AtividadeProcessos,
    evento: FetchDataEvent,
    ehProvidencia?: boolean
  ) {
    //Inclui o filtro "fake" para trazer apenas processos sem responsável
    if (this.apenasProcessosSemResponsavel && !this.ehAtividadeProvidencia) {
      evento.columnsToFilterBy.push({
        cabecalho: "apenasProcessosSemResponsavel",
        atributo: "cpfResponsavelAtual",
        ordenacao: true,
        filtro: {
          texto: "",
          criterio: {
            tipo: ITipoCriterioPesquisa.NUMERO,
            intervalo: false,
            separador: null,
            dominio: null,
          },
          textoVazio: true,
        },
        cssWidth: 240,
        hint: "Origem: e-Processo.<br/>CPF do usuário para o qual o processo está distribuído.",
        ehMoeda: false,
      });
    }

    if (!ehProvidencia) {
      this.obterProcessos(
        atividadeProcessos,
        evento.page,
        evento.itemsPerPage,
        evento.columnsToSortBy,
        evento.columnsToFilterBy
      );
    } else {
      this.obterProvidencias(
        atividadeProcessos,
        evento.page,
        evento.itemsPerPage,
        evento.columnsToSortBy,
        evento.columnsToFilterBy
      );
    }
    atividadeProcessos.ultimoFetchDataEvent = evento;

    //Remove o filtro "fake"
    if (this.apenasProcessosSemResponsavel) {
      var index = evento.columnsToFilterBy.findIndex((column) => {
        return column.cabecalho === "apenasProcessosSemResponsavel";
      });

      evento.columnsToFilterBy.splice(index, 1);
    }
  }

  localizarProcesso() {
    this.localizadorProcessoService
      .obterLocalizacaoAtual({
        listaProcessos: this.processoLocalizar.split(","),
      })
      .subscribe((localizacao) => {
        this.apagarMensagens();
        if (
          localizacao.processosLocalizados.length +
            localizacao.processosNaoLocalizados.length ===
          1
        ) {
          if (localizacao.mensagemValidacao) {
            if (localizacao.exibirPopUp) {
              this.modalRefLocalizadorProcesso = this.modalService.show(
                this.templateModalLocalizadorProcesso,
                { keyboard: false, ignoreBackdropClick: true }
              );
              this.modalRefLocalizadorProcesso.content = {
                mensagemValidacao:
                  localizacao.mensagemValidacao +
                  (localizacao.habilitarVisualizarCaixa
                    ? this.localizadorProcessoService.getMensagemVisualizarProcesso()
                    : ""),
                visualizarProcesso: localizacao.habilitarVisualizarCaixa,
                localizacao:
                  localizacao.processosLocalizados.length === 1
                    ? {
                        equipe: localizacao.processosLocalizados[0].nomeEquipe,
                        atividade:
                          localizacao.processosLocalizados[0].nomeAtividade,
                        responsavel:
                          localizacao.processosLocalizados[0].nomeResponsavel,
                      }
                    : undefined,
                numeroProcesso:
                  localizacao.processosLocalizados.length === 1
                    ? localizacao.processosLocalizados[0].numeroProcesso
                    : localizacao.processosNaoLocalizados[0],
              };
            } else {
              this.mensagensHandler.handleError([
                { uid: "", description: localizacao.mensagemValidacao },
              ]);
            }
          } else {
            this.refreshCaixaTrabalho(
              localizacao.processosLocalizados,
              localizacao.exibirProvidencia
            );
          }
        } else {
          if (
            localizacao.processosLocalizados.length === 0 ||
            localizacao.processosLocalizados.some(
              (p) => p.idEquipe !== localizacao.processosLocalizados[0].idEquipe
            )
          ) {
            this.mensagensHandler.handleError([
              { uid: "", description: localizacao.mensagemValidacao },
            ]);
          } else {
            this.localizadorProcessoService.setMensagemProcessosNaoLocalizados(
              localizacao.mensagemValidacao
            );
            this.refreshCaixaTrabalho(
              localizacao.processosLocalizados,
              localizacao.exibirProvidencia
            );
          }
        }
      });
  }

  houveMudancaColunasFiltro(
    ultimoEvento: FetchDataEvent,
    eventoAtual: FetchDataEvent
  ): boolean {
    if (
      ultimoEvento.columnsToFilterBy.length !==
      eventoAtual.columnsToFilterBy.length
    ) {
      return true;
    }

    var existeColunaDiferente = false;
    eventoAtual.columnsToFilterBy.forEach((colunaAtual) => {
      var colunaExiste = ultimoEvento.columnsToFilterBy.some(
        (colunaAntiga) => colunaAntiga.atributo === colunaAtual.atributo
      );
      if (!colunaExiste) {
        existeColunaDiferente = true;
      }
    });

    return existeColunaDiferente;
  }

  private scrollToAtividade(atividade: IAtividade) {
    document
      .getElementById(`grid-atividade-${atividade.id}`)
      .parentElement.scrollIntoView();
  }

  visualizarProcesso(numeroProcesso: string) {
    this.localizadorProcessoService.visualizarProcesso(numeroProcesso);
  }

  private refreshCaixaTrabalho(
    processosLocalizados: IProcessoLocalizado[],
    exibirProvidencia: boolean
  ) {
    let { idEquipe, idAtividade } = processosLocalizados[0];
    let processos = processosLocalizados.map((p) => p.numeroProcesso).join("|");
    let tipo: string = processosLocalizados.some(
      (p) => !p.processoDistribuidoUsuario
    )
      ? "equipe"
      : TipoCaixaTrabalhoEnum.getDescricao(this.tipoCaixaTrabalho);

    let queryParams: Params;
    queryParams = {
      resourceIdEquipe: idEquipe,
      resourceIdAtividade: idAtividade,
      numerosProcessos: processos,
      abaProvidencia: exibirProvidencia ? "S" : "N",
    };
    if (processosLocalizados.some((p) => p.idAtividade !== idAtividade)) {
      delete queryParams.resourceIdAtividade;
    }

    this.router
      .navigate([`ngx/caixa-trabalho-${tipo}`], { queryParams })
      .then(() => window.location.reload());
  }

  getAtividadeProcessoPopover(idDivGrid: string): AtividadeProcessos {
    var atividadeProcesso: AtividadeProcessos;

    if ($(`#${idDivGrid}`).parent().parent()[0]) {
      var idAtividade: number = Number.parseInt(
        $(`#${idDivGrid}`)
          .parent()
          .parent()[0]
          .id.replace("grid-atividade-", "")
      );
      atividadeProcesso = this.atividadesProcessos.find(
        (item) => item.atividade.id === idAtividade
      );
    }

    return atividadeProcesso;
  }

  ocultarTooltipCabecalhoGrid(event: any, ocultar: boolean) {
    event.stopPropagation();
    if (ocultar) {
      event.target.parentElement.children[3].hidden =
        !event.target.parentElement.children[3].hidden;
    }
  }

  aplicarCssHEAtividadeFutura(idDivGrid: string): boolean {
    let atividade = this.getAtividadeProcessoPopover(idDivGrid);
    if (atividade) {
      return atividade.atividadeFuturaHorasEstimadas != null;
    }
  }

  getTooltipBotaoHorasEstimadas(idDivGrid: string): string {
    let atividade = this.getAtividadeProcessoPopover(idDivGrid);
    if (atividade) {
      let texto = "Hora Estimada na Atividade ";
      if (atividade.atividadeFuturaHorasEstimadas) {
        return texto + atividade.atividadeFuturaHorasEstimadas.nome;
      }
      return texto + "Atual";
    }
    return "";
  }

  aplicarCssHorasEstimadas(processoApoio: IProcessoApoio): boolean {
    return (
      this.atividadesProcessos.find(
        (atv) =>
          atv.processos &&
          atv.processos.some(
            (p) =>
              p.data.dadosFixosProcesso.numeroProcesso ===
              processoApoio.dadosFixosProcesso.numeroProcesso
          )
      ).atividadeFuturaHorasEstimadas != null
    );
  }

  obterAtividadesComProcessosSemResponsavel() {
    this.recarregarProcessos();
  }

  consultarProvidencias(processoApoio: IProcessoApoio) {
    var psNumeroProcesso =
      processoApoio.dadosFixosProcesso.numeroProcesso +
      "@A@@" +
      processoApoio.dadosFixosProcesso.numeroProcessoFormatado;
    this.popupService.abrirPopupConsultarProvidencias(
      psNumeroProcesso,
      TelaOrigemEnum.CAIXA_TRABALHO,
      "N",
      processoApoio.dadosFixosProcesso.numeroProcesso
    );
  }

  carregarAtividadesProvidencia() {
    var caixaTrabalhoProvidencia: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : "",
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: false,
      atividadeProvidencia: true,
      apenasProcessosSemResponsavel: false,
    };
    this.exibirLoading();
    this.completouRequisicaoObterAtividadesProv = false;
    this.caixaTrabalhoService
      .obterAtividadesProvidencias(caixaTrabalhoProvidencia)
      .finally(() => {
        this.ocultarLoading();
      })
      .subscribe((data) => {
        this.atividadesProvidencias = [];
        data.forEach((response) =>
          this.atividadesProvidencias.push({
            atividade: response,
            collapsed: true,
            totalizador: new TotalizadorCaixaTrabalhoVM(),
          })
        );
        this.existeProvidenciaEquipe = this.atividadesProvidencias.length > 0;
        this.obterColunasProvidencias();
        this.completouRequisicaoObterAtividadesProv = true;
      });
  }

  carregarComboFuncionalidadesProvidencia() {
    this.funcionalidadesProvidencia.push(
      { id: 0, nome: "Selecione Funcionalidade..." },
      {
        id: 1,
        nome: "Documentos - Assinar em Lote Documentos com Pendência para Mim",
      },
      { id: 2, nome: "Documentos - Efetivar em Lote Documento Minuta" },
      { id: 8, nome: "Documentos - Juntar Documento / Solicitar Juntada" },
      { id: 4, nome: "Gestão em Horas - Classificar ACT e Tema do Processo" },
      { id: 6, nome: "Providência / Destino - Cancelar" },
      { id: 7, nome: "Providência / Destino - Finalizar" }
    );

    this.funcionalidadeSelecionadaProvidencia =
      this.funcionalidadesProvidencia[0];
  }

  trocarAba($event: NgbTabChangeEvent) {
    this.apenasProcessosSemResponsavel = false;

    if ($event.nextId == "caixaProvidencias") {
      this.cabecalhoCaixaTrabalhoService.setInibirControlesCabecalho(true);
      this.ehAtividadeProvidencia = true;
      if (this.equipeSelecionada) this.carregarAtividadesProvidencia();
    } else {
      this.cabecalhoCaixaTrabalhoService.setInibirControlesCabecalho(false);
      this.ehAtividadeProvidencia = false;
      if (this.equipeSelecionada) this.carregarAtividadesProcessos();
    }
  }

  obterColunasProvidencias() {
    var caixaTrabalhoProvidencia: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : null,
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: false,
      apenasProcessosSemResponsavel: false,
      atividadeProvidencia: true,
      apenasColunas: true,
    };

    this.exibirLoading();
    this.caixaTrabalhoService
      .obterProvidencias(caixaTrabalhoProvidencia)
      .finally(() => {
        this.ocultarLoading();
      })
      .subscribe((data) => {
        this.validador.setUsuarioSupervisor(data[0].usuarioEhSupervisor);
        var resourceIdEquipeQuery =
          this.route.snapshot.queryParamMap.get("resourceIdEquipe");
        var resourceIdAtividadeQuery = this.route.snapshot.queryParamMap.get(
          "resourceIdAtividade"
        );
        var numerosProcessosQuery =
          this.route.snapshot.queryParamMap.get("numerosProcessos");

        this.atividadesProvidencias.forEach((atividadeProvidencia) => {
          if (
            !this.atividadeQueryJaCarregadaAbaProvidencias &&
            numerosProcessosQuery &&
            ((resourceIdAtividadeQuery &&
              atividadeProvidencia.atividade.resourceId ===
                resourceIdAtividadeQuery) ||
              (!resourceIdAtividadeQuery && resourceIdEquipeQuery))
          ) {
            this.loadConfigAtividade(
              atividadeProvidencia,
              data[0].colunas,
              numerosProcessosQuery.split("|"),
              true
            );
          } else {
            this.loadConfigAtividade(
              atividadeProvidencia,
              data[0].colunas,
              null,
              true
            );
          }
        });

        if (!this.atividadeQueryJaCarregadaAbaProvidencias) {
          this.atividadesProvidencias.forEach((atividadeProvidencia) => {
            if (
              (resourceIdAtividadeQuery &&
                atividadeProvidencia.atividade.resourceId ===
                  resourceIdAtividadeQuery) ||
              (!resourceIdAtividadeQuery && resourceIdEquipeQuery)
            ) {
              this.toggleAtividadeProvidencia(atividadeProvidencia.atividade);
            }
          });

          this.atividadeQueryJaCarregadaAbaProvidencias = true;
        }
      });
  }

  toggleAtividadeProvidencia(atividadeSelecionada: IAtividade) {
    let atividadeProvidencia = this.atividadesProvidencias.find(
      (item) => item.atividade.resourceId === atividadeSelecionada.resourceId
    );

    if (!atividadeProvidencia.collapsed) {
      atividadeProvidencia.collapsed = true;
      atividadeProvidencia.processos = undefined;
      return;
    } else {
      this.atualizarProcessos(atividadeProvidencia, true, true);
    }
  }

  obterProvidencias(
    atividadeProcesso: AtividadeProcessos,
    pagina: number,
    itensPorPagina: number,
    colunasOrdenar: EProcessoGridColumn[],
    colunasFiltrar: EProcessoGridColumn[]
  ) {
    var ordenadores = [];
    if (colunasOrdenar && colunasOrdenar.length > 0) {
      var tipoSort =
        colunasOrdenar[0].ordenacao === "asc"
          ? "ASC"
          : colunasOrdenar[0].ordenacao === "desc"
          ? "DESC"
          : undefined;
      ordenadores.push({
        atributo:
          colunasOrdenar[0].atributo === "providencias.indicadorPrioridade"
            ? "prioridade"
            : colunasOrdenar[0].atributo === "providencias.nomeAtividadeAtual"
            ? "nomeAtividadeAtual"
            : colunasOrdenar[0].atributo,
        tipo: tipoSort,
      });
    }

    var filtros = [];
    if (colunasFiltrar && colunasFiltrar.length > 0) {
      colunasFiltrar.forEach((coluna) => {
        //OPERADOR
        var operador = this.identificarOperador(coluna);

        //TIPO VALOR
        var tipoValor = this.identificarTipoValor(coluna);

        //VALORES
        var valores: string[] = [];
        if (coluna.atributo === "numeroProcesso") {
          var listaNumerosProcessos = (<EProcessoGridColumnFilter>coluna.filtro)
            .texto;
          if (listaNumerosProcessos && listaNumerosProcessos.trim() != "") {
            valores = listaNumerosProcessos
              .split(",")
              .map((numeroProcesso) =>
                numeroProcesso.trim().replace(/[^0-9]/g, "")
              );
          }
        } else {
          var valor = (<EProcessoGridColumnFilter>coluna.filtro).texto;
          if (valor && tipoValor === "NUMERO") {
            //Remove caracteres não-numéricos
            if (coluna.atributo === "qtdHorasEstimadas") {
              var tempo = valor.split(":");
              valor = (
                Number.parseInt(tempo[0]) * 60 +
                Number.parseInt(tempo[1])
              ).toString();
            } else {
              valor = valor.replace(/[^0-9]/g, "");
            }
          }
          if (valor && valor.trim() != "") {
            valores.push(valor.trim());
          } else if (operador === "BETWEEN") {
            valores.push("");
          }

          var valorSecundario = (<EProcessoGridColumnFilter>coluna.filtro)
            .textoSecundario;
          if (valorSecundario && tipoValor === "NUMERO") {
            //Remove caracteres não-numéricos
            if (coluna.atributo === "qtdHorasEstimadas") {
              var tempo = valorSecundario.split(":");
              valorSecundario = (
                Number.parseInt(tempo[0]) * 60 +
                Number.parseInt(tempo[1])
              ).toString();
            } else {
              valorSecundario = valorSecundario.replace(/[^0-9]/g, "");
            }
          }
          if (valorSecundario && valorSecundario.trim() != "") {
            valores.push(valorSecundario);
          } else if (operador === "BETWEEN") {
            valores.push("");
          }
        }

        filtros.push({
          atributo: coluna.atributo,
          operador: operador,
          tipoValor: tipoValor,
          valores: valores,
        });
      });
    }

    var atividadeComDestino: boolean = true;
    if (atividadeProcesso.atividade.id == 0) {
      atividadeComDestino = false;
    }

    var apenasProcessosSemResponsavel: boolean = false;
    if (this.apenasProcessosSemResponsavel) {
      apenasProcessosSemResponsavel = true;
    }

    var caixaTrabalhoProvidencia: ICaixaTrabalho = {
      resourceIdEquipe: this.equipeSelecionada.resourceId,
      resourceIdFiltro: this.filtroSelecionado
        ? this.filtroSelecionado.resourceId
        : null,
      resourceIdAtividade: atividadeProcesso.atividade.resourceId,
      apenasUsuario: this.caixaTrabalhoUsuario,
      exibirApensados: false,
      atividadeProvidencia: atividadeComDestino,
      apenasProcessosSemResponsavel: apenasProcessosSemResponsavel,
      eprocessoPaginador: {
        pagina: pagina,
        limite: itensPorPagina,
        ordens: ordenadores,
        filtros: filtros,
      },
    };

    var filtroInformado: boolean = colunasFiltrar && colunasFiltrar.length > 0;

    this.exibirLoading();
    this.caixaTrabalhoService
      .obterProvidencias(caixaTrabalhoProvidencia)
      .finally(() => {
        this.ocultarLoading();
        if (!this.atividadeQueryJaCarregadaAbaProvidencias) {
          this.scrollToAtividade(atividadeProcesso.atividade);
        }
      })
      .subscribe((data) => {
        atividadeProcesso.collapsed = false;
        this.validador.setUsuarioSupervisor(data[0].usuarioEhSupervisor);
        if (
          (data[0].providencias && data[0].providencias.length > 0) ||
          filtroInformado
        ) {
          atividadeProcesso.processos = data[0].providencias.map(
            (providencia) => {
              let row: EProcessoGridRow = { data: providencia };
              return row;
            }
          );

          if (filtroInformado) {
            if (atividadeProcesso.processos.length === 0) {
              alert(
                "Nenhum processo encontrado. Verifique se existe algum filtro aplicado (processo apensado ou filtro dinâmico) e realize nova pesquisa."
              );
            } else if (
              colunasFiltrar.some(
                (coluna) => coluna.atributo === "numeroProcesso"
              )
            ) {
              var colunaNumeroProcesso = colunasFiltrar.find(
                (coluna) => coluna.atributo === "numeroProcesso"
              );
              var numerosProcessosFiltro: string[] = colunaNumeroProcesso
                ? (<EProcessoGridColumnFilter>(
                    colunaNumeroProcesso.filtro
                  )).texto.split(",")
                : [];
              var processosNaoEncontrados = "";

              numerosProcessosFiltro.forEach((numeroProcessoFiltro) => {
                if (numeroProcessoFiltro.trim() !== "") {
                  var numeroRetornadoNaConsulta =
                    atividadeProcesso.processos.some(
                      (processo) =>
                        processo.data.dadosFixosProcesso.numeroProcesso ===
                        numeroProcessoFiltro.trim().replace(/^0+|[^0-9]+/g, "")
                    );

                  if (!numeroRetornadoNaConsulta) {
                    processosNaoEncontrados += numeroProcessoFiltro + ", ";
                  }
                }
              });

              if (processosNaoEncontrados !== "") {
                processosNaoEncontrados = processosNaoEncontrados.substring(
                  0,
                  processosNaoEncontrados.length - 2
                );
                alert(
                  "Processo(s) não exibido(s): " +
                    processosNaoEncontrados +
                    "\n\nPossíveis Motivos:\n- Processo(s) não está(ão) na equipe/atividade.\n- Processo(s) está(ão) na aba de providências.\n- A quantidade de processos filtrados é superior ao limite de exibição de processos por página (Limite atual: " +
                    itensPorPagina +
                    ". Aumente o limite e realize nova busca)."
                );
              }
            }
          }
        } else if (pagina === 1 && !filtroInformado) {
          this.atividadesProcessos = this.atividadesProcessos.filter(
            (item) =>
              item.atividade.resourceId !==
              atividadeProcesso.atividade.resourceId
          );
        } else {
          alert(
            "Não existe próxima página. A paginação se encontra na última página."
          );
          $(
            "#grid-atividade-" +
              atividadeProcesso.atividade.id +
              " a#paginacao-grid-eprocesso-botao-anterior"
          )[0].click();
        }
      });
  }

  providenciasVisiveisChange(
    atividadeProvidencias: AtividadeProcessos,
    providencias: IProvidenciaCaixaTrabalho[]
  ) {
    atividadeProvidencias.totalizador.minutosEstimadosFiltrados = 0;
    atividadeProvidencias.totalizador.numeroProcessosFiltrados = 0;
    providencias.forEach((p) => {
      atividadeProvidencias.totalizador.numeroProcessosFiltrados++;
      atividadeProvidencias.totalizador.addHorasEstimadasFiltrados(
        p.horasEstimadasProvidencia
      );
    });
  }

  providenciasSelecionadasChange(
    atividadeProvidencias: AtividadeProcessos,
    providencias: IProvidenciaCaixaTrabalho[]
  ) {
    if (atividadeProvidencias.processos) {
      atividadeProvidencias.totalizador.minutosEstimadosSelecionados = 0;
      atividadeProvidencias.totalizador.numeroProcessosSelecionados = 0;

      atividadeProvidencias.processos.forEach((p) => {
        if (providencias.includes(p.data)) {
          p.data._selecionado = true;
          atividadeProvidencias.totalizador.numeroProcessosSelecionados++;
          atividadeProvidencias.totalizador.addHorasEstimadasSelecionados(
            p.data.horasEstimadasProvidencia
          );
        } else {
          p.data._selecionado = false;
        }
      });
    }
  }

  private get colunaPrioridadeProvidencia(): EProcessoGridColumn {
    return {
      cabecalho: this.columnHeaderTemplatePrioridade,
      atributo: "providencias.indicadorPrioridade",
      ordenacao: true,
      filtro: false,
      columnDataTemplate: this.columnDataTemplatePrioridadeProvidencia,
      cssTextCenter: false,
      ehMoeda: false,
      cssWidth: 50,
      cssSemOverflow: true,
    };
  }

  private get colunaIndicadoresProvidencia(): EProcessoGridColumn {
    return {
      cabecalho: "Indicadores",
      ordenacao: false,
      filtro: false,
      columnDataTemplate: this.columnDataTemplateIndicadoresProvidencia,
      ehMoeda: false,
    };
  }

  private get colunaAtividadeProvidencia(): EProcessoGridColumn {
    return {
      cabecalho: "Nome Atividade Atual",
      ordenacao: true,
      atributo: "nomeAtividadeAtual",
      filtro: false,
      columnDataTemplate: this.columnDataTemplateAtividadeProvidencia,
      ehMoeda: false,
    };
  }

  obterAtividadesComProvidenciasSemResponsavel() {
    this.recarregarProvidencias();
  }

  recarregarProvidencias(apenasProcessosSemResponsavel?: boolean) {
    if (this.agrupadoPorAtividade) {
      this.zone.run(() => {
        //Obtém novas atividades que passaram a ter algum novo processo

        var caixaTrabalhoProvidencia: ICaixaTrabalho = {
          resourceIdEquipe: this.equipeSelecionada.resourceId,
          resourceIdFiltro: this.filtroSelecionado
            ? this.filtroSelecionado.resourceId
            : "",
          apenasUsuario: this.caixaTrabalhoUsuario,
          exibirApensados: false,
          atividadeProvidencia: true,
          apenasProcessosSemResponsavel: this.apenasProcessosSemResponsavel
            ? true
            : false,
        };

        this.exibirLoading();
        this.caixaTrabalhoService
          .obterAtividadesProvidencias(caixaTrabalhoProvidencia)
          .finally(() => {
            //this.ocultarLoading();
          })
          .subscribe((data) => {
            data.forEach((response) => {
              var atividadeExiste = this.atividadesProvidencias.some(
                (atividadeProvidencia) => {
                  return (
                    atividadeProvidencia.atividade.resourceId ===
                    response.resourceId
                  );
                }
              );

              if (!atividadeExiste) {
                var novaAtividadeProcessos = {
                  atividade: response,
                  collapsed: true,
                  totalizador: new TotalizadorCaixaTrabalhoVM(),
                  config: {
                    colunaSelecao: true,
                    paginacao: true,
                    colunas: (<any>this.atividadesProvidencias[0]).config
                      .colunas,
                  },
                };
                this.atividadesProvidencias.push(novaAtividadeProcessos);
              }
            });

            //Pode ser que alguma atividade não tenha processo sem responsável. Deve ser removida
            if (this.apenasProcessosSemResponsavel) {
              this.atividadesProvidencias = this.atividadesProvidencias.filter(
                (atividadeProvidencia) => {
                  return data.some((response) => {
                    return (
                      response.resourceId ===
                      atividadeProvidencia.atividade.resourceId
                    );
                  });
                }
              );
            }

            this.atividadesProvidencias.sort((a, b) => {
              return a.atividade.nome.localeCompare(b.atividade.nome);
            });

            //Recarrega os processos das atividades expandidas
            var atividadesSelecionadas = this.atividadesProvidencias.filter(
              (atividade) => {
                return !atividade.collapsed;
              }
            );

            atividadesSelecionadas.forEach((atividadeSelecionada) => {
              this.atualizarProcessos(atividadeSelecionada, false, true);
            });
          });
      });
    } else {
      //Atualiza a única grid caso não esteja agrupado por atividades
      if (
        this.atividadesProvidencias &&
        this.atividadesProvidencias.length === 1 &&
        !(<any>this.atividadesProvidencias[0]).collapsed
      ) {
        this.atualizarProcessos(this.atividadesProvidencias[0], false, true);
      }
    }
  }

  obterProvidenciasSelecionadas(): IProvidenciaCaixaTrabalho[] {
    var providenciasSelecionadas: IProvidenciaCaixaTrabalho[] = [];
    this.atividadesProvidencias.forEach((atividade) => {
      if (atividade.processos) {
        atividade.processos.forEach((processo) => {
          if (processo.data._selecionado) {
            providenciasSelecionadas.push(processo.data);
          }
        });
      }
    });

    return providenciasSelecionadas;
  }

  acessarFuncionalidadeProvidencia(
    comboFuncionalidade: HTMLSelectElement,
    funcionalidadeSelecionada: any
  ) {
    this.apagarMensagens();

    //Volta a selecionar a primeira opção
    comboFuncionalidade.selectedIndex = 0;

    //Valida se há equipe e providencia selecionados
    if (
      !this.validador.temProvidenciaSelecionada(
        this.obterProvidenciasSelecionadas()
      )
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    //Chama a funcionalidade
    switch (funcionalidadeSelecionada.id) {
      case 1:
        this.assinarEmLoteProvidencia();
        break;
      case 2:
        this.efetivarDocumentosProvidencia();
        break;
      case 3:
        this.anexarEmLoteProvidencia();
        break;
      case 4:
        this.classificarActProcessoProvidencia();
        break;
      case 6:
        this.operacaoDestino("cancelar");
        break;
      case 7:
        this.operacaoDestino("finalizar");
        break;
      case 8:
        this.juntarDocumentosProvidencia();
        break;
    }
  }

  obterProvidenciasSelecionadasComoString(
    providencias: IProvidenciaCaixaTrabalho[]
  ): string {
    var resourceIds: string = "";
    var separador: string = "||";

    providencias.forEach(
      (instancia: IProvidenciaCaixaTrabalho, index: number) => {
        if (index > 0) {
          resourceIds += separador;
        }
        resourceIds += instancia.resourceId;
      }
    );

    return resourceIds;
  }

  operacaoDestino(operacao: string) {
    this.apagarMensagens();
    var listaProvidenciasSelecionadas: IProvidenciaCaixaTrabalho[];
    listaProvidenciasSelecionadas = this.obterProvidenciasSelecionadas();

    if (
      !this.validador.validarOperacoesProvidenciasSelecionadas(
        listaProvidenciasSelecionadas,
        operacao
      )
    ) {
      this.mostrarMensagemAlerta();
      return;
    }
    var popupParams: { chave: string; valor: string }[] = new Array();
    var urlPopUp: string;
    var larguraTela: number;
    var alturaTela: number;
    var listaResourceIDs = this.obterProvidenciasSelecionadasComoString(
      listaProvidenciasSelecionadas
    );
    popupParams.push({
      chave: "listaResourceIdInstanciaProviencia",
      valor: listaResourceIDs,
    });
    switch (operacao) {
      case "autoDistribuir":
        this.autoDistribuirDestinoProvidencia(listaResourceIDs.split("||"));
        break;
      case "distribuir":
        popupParams.push({
          chave: "resourceIdEquipeAtual",
          valor: this.equipeSelecionada.resourceId,
        });
        urlPopUp =
          "ngx/:tokenMomento/providencia-destino/distribuir-destino/distribuir-destino-providencia";
        larguraTela = 600;
        alturaTela = 280;
        break;
      case "redistribuir":
        popupParams.push({
          chave: "resourceIdEquipeAtual",
          valor: this.equipeSelecionada.resourceId,
        });
        urlPopUp =
          "ngx/:tokenMomento/providencia-destino/redistribuir-destino/redistribuir-destino-providencia";
        larguraTela = 770;
        alturaTela = 340;
        break;
      case "liberar":
        urlPopUp =
          "ngx/:tokenMomento/providencia-destino/liberar-destino/liberar-destino-providencia";
        larguraTela = 770;
        alturaTela = 260;
        break;
      case "movimentar":
        popupParams.push({
          chave: "resourceIdUnidadeAtual",
          valor: this.equipeSelecionada.resourceIdUnidadeArvore,
        });
        popupParams.push({
          chave: "idAtividadeAtual",
          valor:
            listaProvidenciasSelecionadas[0].idAtividadeInstancia.toString(),
        });
        popupParams.push({
          chave: "indicadorDistribuido",
          valor: this.validador.instanciaNaoLiberada(
            listaProvidenciasSelecionadas
          )
            ? "S"
            : "N",
        });
        urlPopUp =
          "ngx/:tokenMomento/providencia-destino/movimentar-destino/movimentar-destino-providencia";
        larguraTela = 900;
        alturaTela = 660;
        break;
      case "finalizar":
        if (
          this.validador.ehInstaciaProvidencia(listaProvidenciasSelecionadas[0])
        ) {
          urlPopUp =
            "ngx/:tokenMomento/providencia-destino/finalizar-destino/finalizar-destino-providencia";
        } else {
          urlPopUp =
            "ngx/:tokenMomento/providencia-destino/finalizar/finalizar-providencia";
        }
        larguraTela = 620;
        alturaTela = 355;
        break;
      case "cancelar":
        if (
          this.validador.ehInstaciaProvidencia(listaProvidenciasSelecionadas[0])
        ) {
          urlPopUp =
            "ngx/:tokenMomento/providencia-destino/cancelar-destino/cancelar-destino-providencia";
        } else {
          urlPopUp =
            "ngx/:tokenMomento/providencia-destino/cancelar/cancelar-providencia";
        }
        larguraTela = 620;
        alturaTela = 355;
        break;
      default:
        break;
    }
    // abre popup
    if (operacao != "autoDistribuir")
      this.popupService.abrirPopupOperacoesProvidencias(
        urlPopUp,
        popupParams,
        larguraTela,
        alturaTela
      );
  }

  private autoDistribuirDestinoProvidencia(
    listaProvidenciasSelecionadas: string[]
  ): void {
    var operacaoInstanciasProvidencia = new OperacaoInstanciasProvidencia();
    operacaoInstanciasProvidencia.resourceIdsInstancia =
      listaProvidenciasSelecionadas;
    operacaoInstanciasProvidencia.tipoOperacao = "autoDistribuir";
    operacaoInstanciasProvidencia.resourceIdEquipeAutodistribuicao =
      this.equipeSelecionada.resourceId;
    operacaoInstanciasProvidencia.dadosOperacao = new InstanciaProvidencia();
    operacaoInstanciasProvidencia.dadosOperacao.movimentacaoAtual =
      new MovimentacaoProvidencia();
    operacaoInstanciasProvidencia.dadosOperacao.movimentacaoAtual.distribuicaoSelecionada =
      new DistribuicaoProvidencia();
    operacaoInstanciasProvidencia.dadosOperacao.movimentacaoAtual.distribuicaoSelecionada.membroAtual =
      null;

    this.providenciaService
      .atualizarInstanciaProvidencia(operacaoInstanciasProvidencia)
      .subscribe(
        () => {
          this.mostrarMensagemSucesso(
            "Auto Distribuição realizada com sucesso"
          );
          this.recarregarProvidencias();
        },
        (err) => {}
      );
  }

  assinarEmLoteProvidencia() {
    this.apagarMensagens();
    var listaProvidenciasSelecionadas: IProvidenciaCaixaTrabalho[] =
      this.obterProvidenciasSelecionadas();
    if (
      !this.validador.temProvidenciaSelecionada(listaProvidenciasSelecionadas)
    ) {
      this.mostrarMensagemAlerta();
      return;
    }

    var numerosProcessos: IProcessoSelecionado[] =
      listaProvidenciasSelecionadas.map((providencia) => {
        var cpfResponsavel = providencia.cpfResponsavelAtual
          ? this.usuarioLogadoService.gerarCPFComDV(
              providencia.cpfResponsavelAtual,
              false
            )
          : undefined;

        return {
          numeroProcesso: providencia.numeroProcesso,
          emLote: providencia.idLoteAtual ? true : false,
          cpfResponsavel: cpfResponsavel,
          numeroProcessoFormatado: providencia.numeroProcessoFormatado,
          sigiloso: providencia.indicadorProcessoSigiloso,
          ehDossie: providencia.ehDossie,
          nomeNivelSigiloInterno: providencia.nomeNivelSigiloInterno,
        };
      });

    this.popupService.abrirPopupDocumentosPendenciaAssinatura(numerosProcessos);
  }

  anexarEmLoteProvidencia() {
    this.apagarMensagens();
    var listaProvidenciasSelecionadas: IProvidenciaCaixaTrabalho[] =
      this.obterProvidenciasSelecionadas();

    if (
      !this.validador.temProvidenciaSelecionada(listaProvidenciasSelecionadas)
    ) {
      this.mostrarMensagemAlerta();
      return;
    }
    if (
      this.validador.temAtividadesProcessoDistintasSelecionadas(
        listaProvidenciasSelecionadas
      ) ||
      this.validador.naoResponsavelInstanciaProcessoProvidencia(
        listaProvidenciasSelecionadas
      )
    ) {
      this.mostrarMensagemAlerta();
      return;
    }
    //Funcao para obter array de processos no formado NUMEROPROC|NOMECONTRIBUINTE
    var obterNumerosComNomeContribuinte = (
      processosSelecionados: IProvidenciaCaixaTrabalho[]
    ): string => {
      var numerosProcessos: string = "";

      processosSelecionados.forEach(
        (processo: IProvidenciaCaixaTrabalho, index: number) => {
          if (index > 0) {
            numerosProcessos += "||";
          }

          numerosProcessos +=
            processo.numeroProcessoFormatado +
            "|" +
            (processo.nomeContribuinte ? processo.nomeContribuinte : "-");
        }
      );

      return numerosProcessos;
    };

    var numerosProcessosComNomeContribuinte: string =
      obterNumerosComNomeContribuinte(listaProvidenciasSelecionadas);
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      listaProvidenciasSelecionadas[0].equipeAtividadeAtualProcesso
    );
    var nomeAtividade = listaProvidenciasSelecionadas[0].nomeAtividadeAtual;

    var url =
      "../ControleAnexarLoteDocumento.asp?psAcao=apresentarpagina&psRelacaoProcessos=" +
      numerosProcessosComNomeContribuinte +
      "&psNumeroEquipeAtividade=" +
      numeroEquipeAtividade +
      "&psNomeAtividadeAtual=" +
      nomeAtividade;
    (<any>window).openDialogPOST(
      url,
      1180,
      710,
      true,
      "",
      "",
      "",
      "",
      "",
      "",
      true
    );
  }

  classificarActProcessoProvidencia() {
    this.apagarMensagens();
    var listaProvidenciasSelecionadas: IProvidenciaCaixaTrabalho[] =
      this.obterProvidenciasSelecionadas();

    var processosSelecionadosAvulsos = listaProvidenciasSelecionadas.filter(
      (processo) => {
        //Apenas processos que não estejam em lote
        return !processo.idLoteAtual;
      }
    );
    var lotesSelecionados: ILoteCaixaTrabalho[] =
      this.obterLotesProvidenciasSelecionadas(listaProvidenciasSelecionadas);

    var numerosProcessos: string =
      this.obterProcessosProvidenciasSelecionadasComoString(
        processosSelecionadosAvulsos
      );
    var numeroEquipeAtividade = this.obterNumeroEquipeAtividade(
      listaProvidenciasSelecionadas[0].equipeAtividadeAtualProcesso
    );
    var chaveEquipe = this.obterNumeroEquipe(
      listaProvidenciasSelecionadas[0].equipeAtividadeAtualProcesso
    );
    var cpfUsuarioAtual = this.usuarioLogadoService.gerarCPFComDV(
      this.usuarioLogado.cpfUsuarioSemDV.toString(),
      false
    );
    var numerosLotes = this.obterLotesSelecionadosComoString(lotesSelecionados);

    //Funcao para obter array de processos no formado NUMEROPROC|NATUREZA|SIGILO
    var obterNumerosComNaturezaESigilo = (
      processosSelecionados: IProvidenciaCaixaTrabalho[]
    ): string => {
      var numerosProcessos: string = "";

      processosSelecionados.forEach(
        (processo: IProvidenciaCaixaTrabalho, index: number) => {
          if (index > 0) {
            numerosProcessos += "||";
          }

          numerosProcessos +=
            processo.numeroProcesso +
            "|D|" +
            (processo.indicadorProcessoSigiloso ? "S" : "N") +
            "|" +
            processo.numeroProcessoFormatado;
        }
      );

      return numerosProcessos;
    };

    var numerosProcessosComNaturezaESigilo: string =
      obterNumerosComNaturezaESigilo(processosSelecionadosAvulsos);

    //Validações feitas pelo VB
    this.caixaTrabalhoService
      .verificarParaClassificarACT(
        chaveEquipe,
        numeroEquipeAtividade,
        cpfUsuarioAtual,
        numerosLotes,
        numerosProcessos
      )
      .subscribe((data) => {
        if (data && data.erro) {
          this.mostrarMensagemAlerta(data.erro);
        } else {
          this.popupService.abrirPopupClassificarActProcesso(
            numeroEquipeAtividade,
            numerosLotes,
            numerosProcessosComNaturezaESigilo,
            "S"
          );
        }
      });
  }

  obterProcessosProvidenciasSelecionadasComoString(
    providenciasSelecionadas: IProvidenciaCaixaTrabalho[],
    opcoes?: {
      novoSeparador?: string;
      incluirProcessoFormatado?: boolean;
      incluirApenasFormatados?: boolean;
    }
  ): string {
    var numerosProcessos: string = "";
    var separador: string = "|";

    if (opcoes && opcoes.novoSeparador) {
      separador = opcoes.novoSeparador;
    }

    providenciasSelecionadas.forEach(
      (providencia: IProvidenciaCaixaTrabalho, index: number) => {
        if (index > 0) {
          numerosProcessos += separador;
        }

        if (opcoes && opcoes.incluirApenasFormatados) {
          numerosProcessos += providencia.numeroProcessoFormatado;
        } else {
          numerosProcessos += providencia.numeroProcesso;

          if (opcoes && opcoes.incluirProcessoFormatado) {
            numerosProcessos += "@" + providencia.numeroProcessoFormatado;
          }
        }
      }
    );

    return numerosProcessos;
  }

  obterLotesProvidenciasSelecionadas(
    processosSelecionados: IProvidenciaCaixaTrabalho[]
  ): ILoteCaixaTrabalho[] {
    var lotesSelecionados: ILoteCaixaTrabalho[] = [];
    processosSelecionados.forEach((processo) => {
      if (processo.idLoteAtual) {
        var loteJaEncontrado = lotesSelecionados.some((lote) => {
          return processo.idLoteAtual
            ? lote.id === processo.idLoteAtual
            : false;
        });

        if (!loteJaEncontrado) {
          lotesSelecionados.push({
            id: processo.idLoteAtual,
            nome: processo.nomeLoteAtual,
          });
        }
      }
    });

    return lotesSelecionados;
  }

  consultarPalavraChaveProvidencia(processoApoio: IProvidenciaCaixaTrabalho) {
    var psNumeroProcesso = processoApoio.numeroProcesso;
    var pbResponsavel = processoApoio.ehResponsavelProcesso ? "Sim" : "Nao";
    var url =
      "../ControleConsultarPalavrasChave.asp?psAcao=exibir&psNumeroDocumento=&pbResponsavelProcesso=" +
      pbResponsavel +
      "&psNumeroProcesso=" +
      psNumeroProcesso;
    (<any>window).openDialog(
      url,
      650,
      580,
      false,
      ",scrollbars=yes",
      0,
      200,
      0,
      0,
      0,
      true
    );
  }

  consultarHistoricoProvidencia(processoApoio: IProvidenciaCaixaTrabalho) {
    var numeroProcesso = processoApoio.numeroProcesso;
    this.popupService.abrirPopupHistoricoProcesso(numeroProcesso);
  }

  consultarJuntadaProvidencia(processoApoio: IProvidenciaCaixaTrabalho) {
    var psNumeroProcesso = processoApoio.numeroProcesso;
    var equipeAtividade = processoApoio.equipeAtividadeAtualProcesso;
    var psEquipeAtividade =
      equipeAtividade.id +
      "|" +
      equipeAtividade.idEquipe +
      "|" +
      equipeAtividade.idTipoUnidade +
      "|1|" +
      equipeAtividade.idAtividade;
    var url =
      "../ControleConsultarJuntadasProcesso.asp?psAcao=apresentarPagina&psNumeroProcesso=" +
      psNumeroProcesso +
      "&psProcessoJuntado=N&psProcessoApensado=N&psEquipeAtividade=" +
      psEquipeAtividade;
    (<any>window).openDialog(url, 800, 600);
  }

  consultarIndicadorNotaProvidencia(processoApoio: IProvidenciaCaixaTrabalho) {
    console.log("here");
    var psNumeroProcesso = processoApoio.numeroProcesso;
    var equipeAtividade = processoApoio.equipeAtividadeAtualProcesso;
    var psEquipeAtividade =
      equipeAtividade.id +
      "|" +
      equipeAtividade.idEquipe +
      "|" +
      equipeAtividade.idTipoUnidade +
      "|1|" +
      equipeAtividade.idAtividade;
    var url =
      "../ControleNota.asp?psAcao=exibir&psNumeroProcesso=" +
      psNumeroProcesso +
      "&psEscopoNota=NI&psNumeroEquipeAtividade=" +
      psEquipeAtividade;
    (<any>window).openDialog(
      url,
      590,
      400,
      false,
      ",scrollbars=yes",
      0,
      200,
      0,
      0,
      0,
      0
    );
  }

  listarNotasProcesso(processoApoio: IProvidenciaCaixaTrabalho) {
    let numeroProcesso = processoApoio.numeroProcesso.replace(/[^\d]+/g, "");
    this.popupService.abrirPopupNotasProcesso(numeroProcesso);
  }

  consultarProvidenciasProvidencia(processoApoio: IProvidenciaCaixaTrabalho) {
    var psNumeroProcesso =
      processoApoio.numeroProcesso +
      "@A@@" +
      processoApoio.numeroProcessoFormatado;
    this.popupService.abrirPopupConsultarProvidencias(
      psNumeroProcesso,
      TelaOrigemEnum.CAIXA_TRABALHO,
      "S",
      processoApoio.numeroProcesso
    );
  }

  consultarIndicadorSolicitacaoJuntadaProvidencia(
    processoApoio: IProvidenciaCaixaTrabalho
  ) {
    var psNumeroProcesso = processoApoio.numeroProcesso;
    this.popupService.abrirPopupConsultarSolicitacaoJuntada(psNumeroProcesso);
  }

  consultarIndicadorSolidarioProvidencia(
    processoApoio: IProvidenciaCaixaTrabalho
  ) {
    var psNumeroProcesso = processoApoio.numeroProcesso;
    var psNumeroProcessoFormatado = processoApoio.numeroProcessoFormatado;
    this.popupService.abrirPopupConsultarInteressadosAdicionais(
      psNumeroProcesso,
      psNumeroProcessoFormatado,
      TelaOrigemEnum.CAIXA_TRABALHO
    );
  }

  definirNivelSigiloProvidencia(processoApoio: IProvidenciaCaixaTrabalho) {
    var psNumeroProcesso = processoApoio.numeroProcesso;
    var pbResponsavel = processoApoio.ehResponsavelProcesso;
    if (pbResponsavel) {
      this.popupService.abrirPopupDefinirNivelSigilo(psNumeroProcesso);
    }
  }

  checkboxLoteChangeProvidencia(
    processoApoio: IProvidenciaCaixaTrabalho,
    $event: any
  ): EProcessoGridDataSelect[] {
    this.marcarOutrosCheckboxLote($event.target);
    return [
      {
        valor: processoApoio.idLoteAtual,
        atributo: "idLoteAtual",
        selected: $event.target.checked,
      },
    ];
  }

  retornaGrauSimilaridade(valor) {
    let valorSemZerosAEsquerda = valor
      ? StringUtils.removerZerosAEsquerda(valor)
      : "";
    if (valorSemZerosAEsquerda == ",00") {
      return "0,00%";
    }
    return valorSemZerosAEsquerda != "" ? valorSemZerosAEsquerda + "%" : "";
  }

  retornaQuantidadeNumeroProcessoAgrupamento(valor): string {
    let valorSemZerosAEsquerda = valor
      ? StringUtils.removerZerosAEsquerda(valor)
      : "";
    if (valorSemZerosAEsquerda == "" && valor == "00000") {
      return "0";
    }
    return valorSemZerosAEsquerda;
  }

  getTooltipSigiloExterno(processoApoio) {
    if (!processoApoio) {
      return "";
    }
    return (
      "Nível do Sigilo Externo: " +
      formatarNivelSigilo(
        processoApoio.dadosFixosProcesso.nomeNivelSigiloExterno
      ) +
      "."
    );
  }
}
