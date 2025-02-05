import { OnInit, Component, NgZone, ViewChild, ElementRef } from "@angular/core";
import { CabecalhoCaixaTrabalhoService } from "./cabecalho-caixa-trabalho.service";
import { IEquipeCaixaTrabalho } from "main/ts/domain/IEquipeCaixaTrabalho";
import { CaixaTrabalhoService } from "../shared/services/caixa-trabalho.service";
import { IFiltroCaixaTrabalho } from "main/ts/domain/IFiltroCaixaTrabalho";
import { LoaderService } from "app/ngx/infra/shared/services/loader.service";
import { TipoCaixaTrabalhoEnum } from "app/ngx/shared/models/enums/tipo-caixa-trabalho-enum";
import { LocalStorageService } from "angular-2-local-storage";

@Component({
    selector: 'cabecalho-caixa-trabalho',
    templateUrl: './cabecalho-caixa-trabalho.component.html',
    styleUrls: ['cabecalho-caixa-trabalho.component.css'.toString()],
    host: {
        '(window:resize)': 'ajustarResponsividadeCabecalhoTitle(); ajustarResponsividadeCabecalhoBody(true);'
      }
})
export class CabecalhoCaixaTrabalhoComponent implements OnInit {
    
    filtros: IFiltroCaixaTrabalho[] = [];
    filtroSelecionado: IFiltroCaixaTrabalho = null;

    equipes: IEquipeCaixaTrabalho[] = [];
    equipeSelecionada: IEquipeCaixaTrabalho = null;
    exibirTodasEquipes: boolean = false;    

    semAgrupamento: boolean = false;
    exibirApensados: boolean = false;

    exibirCabecalho: boolean = false;
    inibirControlesCabecalho: boolean = false;

    buscarFiltroPadrao: ()=>boolean;
    ajustarResponsividadeCabecalhoTitle: ()=>boolean;
    ajustarResponsividadeCabecalhoBody: ()=>boolean;

    widthCabecalho: WidthCabecalho;

    @ViewChild('container') container: ElementRef;
    @ViewChild('autocompleteEquipe') autocompleteEquipe: ElementRef;
    @ViewChild('checkExibirTodas') checkExibirTodas: ElementRef;
    @ViewChild('checkSemAgrupamento') checkSemAgrupamento: ElementRef;
    @ViewChild('checkExibirApensados') checkExibirApensados: ElementRef;
    @ViewChild('autocompleteFiltro') autocompleteFiltro: ElementRef;

    constructor(private caixaTrabalhoService: CaixaTrabalhoService, 
                private cabecalhoCaixaTrabalhoService: CabecalhoCaixaTrabalhoService,
                private loaderService: LoaderService,
                private zone:NgZone,
                private localStorageService: LocalStorageService){}

    ngOnInit() {
        this.cabecalhoCaixaTrabalhoService.observableExibirCabecalho()
            .subscribe(exibir => {               
                this.exibirCabecalho = exibir;
                if(this.exibirCabecalho){
                    if(!this.funcoesResponsividadeCabecalhoForamDefinidas()) {
                        this.definirFuncoesResponsividadeCabecalho();
                        this.ajustarResponsividadeCabecalhoTitle();
                        this.ajustarResponsividadeCabecalhoBody();
                    }
                    this.obterEquipes();
                    this.obterFiltros();
                    
                } else {
                    this.removerFuncoesResponsividadeCabecalho();
                    this.filtros= [];
                    this.equipes = [];
                    this.filtroSelecionado= null;
                    this.equipeSelecionada = null;
                    this.exibirTodasEquipes = false;    
                    this.semAgrupamento = false;
                    this.exibirApensados = false;                    
                }
            });

        this.inibirControlesParaProvidencia();

        this.cabecalhoCaixaTrabalhoService.observableLimparComboEquipe()
            .subscribe(() => {this.removerFuncaoFiltroPadrao(); this.equipeSelecionada = null});
        this.cabecalhoCaixaTrabalhoService.observableLimparComboFiltro()
            .subscribe(() => this.filtroSelecionado = null);
        
    }

    private funcoesResponsividadeCabecalhoForamDefinidas() : boolean {
        return this.ajustarResponsividadeCabecalhoTitle && this.ajustarResponsividadeCabecalhoTitle() 
            && this.ajustarResponsividadeCabecalhoBody && this.ajustarResponsividadeCabecalhoBody();
    }

    private removerFuncoesResponsividadeCabecalho() {
        var pageHeaderBody = document.getElementById('headerBody');
        pageHeaderBody.style.width = '0px';
        this.ajustarResponsividadeCabecalhoTitle = () => {
            return false;
        };
        this.ajustarResponsividadeCabecalhoBody = (resized?: boolean) => {
            return false;
        };
    }

    private definirFuncoesResponsividadeCabecalho() {
        this.ajustarResponsividadeCabecalhoTitle = () => {
            var pageHeaderTitle = document.getElementById('headerTitle');
            var pageHeaderBody = document.getElementById('headerBody');
            pageHeaderBody.style.width = 'calc(100% - ' + (pageHeaderTitle.offsetWidth + 2) + 'px)';
            return true;
        };
        this.ajustarResponsividadeCabecalhoBody = (resized?: boolean) => {
            setTimeout(() => {
                if (this.autocompleteEquipe &&
                    this.autocompleteFiltro &&
                    this.checkSemAgrupamento &&
                    this.checkExibirApensados &&
                    ((this.caixaTrabalhoUsuario && !this.checkExibirTodas) ||
                        (!this.caixaTrabalhoUsuario && this.checkExibirTodas))) {
    
                    if (!this.widthCabecalho) {
                        this.widthCabecalho = new WidthCabecalho();
                        this.widthCabecalho.widthContainer = this.container.nativeElement.offsetWidth;
                        this.widthCabecalho.widthAutocompleteEquipe = this.autocompleteEquipe.nativeElement.offsetWidth + 16;
                        this.widthCabecalho.widthAutocompleteFiltro = this.autocompleteFiltro.nativeElement.offsetWidth + 16;
                        this.widthCabecalho.widthCheckExibirTodas = 0;
                        this.widthCabecalho.widthCheckSemAgrupamento = this.checkSemAgrupamento.nativeElement.offsetWidth;
                        this.widthCabecalho.widthCheckExibirApensados = this.checkExibirApensados.nativeElement.offsetWidth;
                    } else if(resized){
                        this.widthCabecalho.widthContainer = this.container.nativeElement.offsetWidth;
                    }
                     
                    if (this.checkExibirTodas && this.widthCabecalho.widthCheckExibirTodas === 0) {
                        this.widthCabecalho.widthCheckExibirTodas = this.checkExibirTodas.nativeElement.offsetWidth;
                    }
    
                    if (this.checkExibirTodas) {
                        this.checkExibirTodas.nativeElement.style.padding = this.widthCabecalho.cssPaddingCheckExibirTodas(this.caixaTrabalhoUsuario);
                    }
                    this.checkSemAgrupamento.nativeElement.style.padding = this.widthCabecalho.cssPaddingCheckSemAgrupamento(this.caixaTrabalhoUsuario);
                    this.checkExibirApensados.nativeElement.style.padding = this.widthCabecalho.cssPaddingCheckExibirApensados(this.caixaTrabalhoUsuario);
                } else {
                    this.ajustarResponsividadeCabecalhoBody();
                }
            }, 100);
            return true;
        };
    }

    ngAfterViewInit() {
        this.cabecalhoCaixaTrabalhoService.observableSelecionarEquipe()
            .subscribe(resourceIdEquipeQueryString => {
                if(resourceIdEquipeQueryString) {
                    this.cabecalhoCaixaTrabalhoService.observableSelecionarAtividade()
                        .subscribe(resourceIdAtividadeQueryString => {
                            if(!resourceIdAtividadeQueryString) {
                                this.semAgrupamento = true;
                            } else {
                                this.semAgrupamento = false;
                            }
                        });
                }
            });
    }

    obterEquipes(usuarioClicouAtualizarEquipes?: boolean) {
        //Se o resourceId da Equipe veio por queryString
        this.cabecalhoCaixaTrabalhoService.observableSelecionarEquipe()
            .subscribe(resourceIdEquipeQueryString => {
                if(resourceIdEquipeQueryString) {
                    this.exibirTodasEquipes = true;
                }
                this.caixaTrabalhoService.obterEquipes(this.exibirTodasEquipes == undefined ? false : this.exibirTodasEquipes)
                    .subscribe(data => {
                        this.equipes = data;
                        this.equipeSelecionada = null;
                        if(this.equipes.length === 1) {
                            this.equipeSelecionada = this.equipes[0];
                        }

                        //Se o resourceId da Equipe veio por queryString
                        if(resourceIdEquipeQueryString) {
                            var equipeQueryString = this.equipes.find(equipe => {
                                return equipe.resourceId === resourceIdEquipeQueryString;
                            });
                            if(equipeQueryString) {
                                this.equipeSelecionada = equipeQueryString;
                            } else {
                                this.definirFuncaoFiltroPadrao();
                            }
                        } else {
                            //Se o usuário já tinha selecionado uma equipe e está retornando à caixa de trabalho
                            var resourceIdEquipePreSelecionada = this.localStorageService.get<string>("equipeSelecionadaCxTrab");
                            if(resourceIdEquipePreSelecionada && resourceIdEquipePreSelecionada.trim() != "" && this.equipes.length > 1){
                                var equipePreSelecionada = this.equipes.find(equipe => {
                                    return equipe.resourceId === resourceIdEquipePreSelecionada;
                                });
                                if(equipePreSelecionada) {
                                    this.equipeSelecionada = equipePreSelecionada;
                                } else {
                                    this.definirFuncaoFiltroPadrao();
                                }
                            } else {
                                this.definirFuncaoFiltroPadrao();
                            }
                            if (usuarioClicouAtualizarEquipes) {
                                this.removerFuncaoFiltroPadrao();
                            }
                        }
                    });
            });
    }

    obterFiltros(nome?: string) {
        this.exibirLoading();
        this.caixaTrabalhoService.obterFiltros()
            .finally(()=>{
                this.ocultarLoading();
            })
            .subscribe(data => {
                var ordenar = (a, b) => {return a.nome.localeCompare(b.nome);};

                this.filtros = data;
                this.filtros.sort(ordenar);

                //adiciona o filtro 'Sem Filtro'
                this.filtros.unshift({ nome: "Sem Filtro", padrao: false, resourceId: "Sem Filtro", resourceIdTipoUnidade: null });

                //Se o resourceId da Equipe veio por queryString
                this.cabecalhoCaixaTrabalhoService.observableSelecionarEquipe()
                    .subscribe(resourceIdEquipeQueryString => {
                        var filtroPadrao = this.filtros.find(item => {
                            return item.padrao;
                        });
        
                        if(filtroPadrao) {
                            filtroPadrao.nome += " (Padrão)";
                            this.filtroSelecionado = filtroPadrao;
                        } else {
                            //"Sem Filtro"
                            this.filtroSelecionado = this.filtros[0];
                        }

                        if(resourceIdEquipeQueryString) {
                            this.filtroSelecionado = this.filtros[0];
                        } else {            
                            if(nome && nome.length > 0 && typeof nome === 'string') {
                                var filtroEncontrado = this.filtros.find((filtro)=>{
                                    return filtro.nome.trim() === nome.trim();
                                });
            
                                if(filtroEncontrado) this.filtroSelecionado = filtroEncontrado;
                            } else {
                                //Se o usuário já tinha selecionado um filtro e está retornando à caixa de trabalho
                                var resourceIdFiltroPreSelecionado = this.localStorageService.get<string>("filtroSelecionadoCxTrab");
                                if(resourceIdFiltroPreSelecionado && resourceIdFiltroPreSelecionado.trim() != ""){
                                    var filtroPreSelecionado = this.filtros.find(filtro => {
                                        return filtro.resourceId === resourceIdFiltroPreSelecionado;
                                    });
                                    if(filtroPreSelecionado) {
                                        this.filtroSelecionado = filtroPreSelecionado;
                                    }
                                }
                            }
                        }
                    });
            });
    }

    atualizarEquipes() {
        this.obterEquipes(true);
    }

    get equipeFoiSelecionada() : boolean {
        return this.equipeSelecionada !== null && typeof this.equipeSelecionada === 'object';
    }

    get filtroFoiSelecionado() : boolean {
        return this.filtroSelecionado !== null && typeof this.filtroSelecionado === 'object';
    }

    private removerFuncaoFiltroPadrao() {
        this.buscarFiltroPadrao = undefined;
    }

    private definirFuncaoFiltroPadrao() {
        this.buscarFiltroPadrao = () => {
            var houveAlteracaoFiltro: boolean = false;

            if(this.equipeSelecionada) {
                var filtroASerAplicado: IFiltroCaixaTrabalho;

                //Busca o filtro Padrão
                var filtroPadrao = this.filtros.find(filtro => {
                    return filtro.padrao;
                });
    
                if(filtroPadrao) {
                    filtroASerAplicado = filtroPadrao;
                } else {
                    //Se não há filtro Padrão, buscar filtro de Tipo de Unidade e depois de Unidade
                    var filtroTipoUnidade = this.filtros.find(filtro => {
                        return !filtro.resourceIdUnidade && filtro.resourceIdTipoUnidade === this.equipeSelecionada.resourceIdTipoUnidade;
                    });
    
                    if(filtroTipoUnidade) {
                        filtroASerAplicado = filtroTipoUnidade;
                    } else {
                        var filtroUnidade = this.filtros.find(filtro => {
                            return filtro.resourceIdUnidade === this.equipeSelecionada.resourceIdUnidade;
                        });
    
                        if(filtroUnidade) {
                            filtroASerAplicado = filtroUnidade;
                        } else {
                            filtroASerAplicado = this.filtros.find(filtro => {
                                return filtro.nome === "Sem Filtro";
                            });
                        }
                    }
                }

                houveAlteracaoFiltro = (this.filtroSelecionado && filtroASerAplicado) && (this.filtroSelecionado.resourceId !== filtroASerAplicado.resourceId);

                this.filtroSelecionado = filtroASerAplicado;
            }

            return houveAlteracaoFiltro;
        };
    }

    ativarSelecaoEquipe() {
        var houveAlteracaoFiltro: boolean;
        if(!this.inibirControlesCabecalho){
            if(!this.buscarFiltroPadrao) {
                this.definirFuncaoFiltroPadrao();
            } else {
                houveAlteracaoFiltro = this.buscarFiltroPadrao();
            }
        }
        
        if(this.combosCarregados && this.filtroFoiSelecionado && !houveAlteracaoFiltro) {
            //Carrega as atividades se selecionou um filtro
            this.obterAtividades();
        }

        this.localStorageService.set("equipeSelecionadaCxTrab", ((this.equipeSelecionada && this.equipeSelecionada.resourceId)? this.equipeSelecionada.resourceId : null));
    }

    ativarSelecaoFiltro() {
        if(this.combosCarregados && this.equipeFoiSelecionada) {
            //Carrega as atividades se selecionou uma equipe
            this.obterAtividades();
        }

        this.localStorageService.set("filtroSelecionadoCxTrab", ((this.filtroSelecionado && this.filtroSelecionado.resourceId)? this.filtroSelecionado.resourceId : null));
    }

    obterAtividades() {
        this.cabecalhoCaixaTrabalhoService.carregarAtividadesProcesso({            
            equipeSelecionada : this.filtroSelecionado ? this.equipeSelecionada : null, 
            filtroSelecionado : (this.filtroSelecionado && this.filtroSelecionado.resourceId !== "Sem Filtro") ? this.filtroSelecionado : null, 
            agrupadoPorAtividade: !this.semAgrupamento, 
            exibirApensados : this.exibirApensados
        });
    }

    editarFiltro() {
        var ids = "";

        var findUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        var idTiposUnidadeUnicos = this.filtros.map((filtro) => {
            return filtro.idTipoUnidade;
        }).filter(findUnique);

        idTiposUnidadeUnicos.forEach((id, index) => {
            if(id) {
                ids += id + "|1"
                if(index < idTiposUnidadeUnicos.length - 1) {
                    ids += "@"
                }
            }
        });

        var url = "../ControleManterFiltros.asp?psAcao=listarFiltros&psTipoUnidadeFiltro="+ ids +"&pnFiltroAtivo=";
        (<any>window).openDialog(url, 400, 500);

        (<any>window).selfCabecalhoCaixaTrabalho = this;
    }
    
    //Chamado ao selecionar um dos filtros na popup
    selecionarFiltro(nome : string) {
        var filtroASelecionar;

        if(nome) {
            filtroASelecionar = nome;
        } else if(this.filtroSelecionado) {
            filtroASelecionar = this.filtroSelecionado.nome;
        }

        this.obterFiltros(filtroASelecionar);
    }
    //Força a exibição do loader ao selecionar um dos filtros na popup
    exibirLoading() {
        this.zone.run(()=> {
            this.loaderService.setMsgLoading("Aguarde...");
            this.loaderService.show();    
        })
    }
    //Oculta o loader ao selecionar um dos filtros na popup
    ocultarLoading() {
        this.zone.run(()=> {
            this.loaderService.hide();
        })
    }

    get caixaTrabalhoUsuario() : boolean {
        return this.cabecalhoCaixaTrabalhoService.tipoCaixaTrabalho === TipoCaixaTrabalhoEnum.USUARIO;
    }

    get combosCarregados() : boolean {
        var equipesCarregadas : boolean = (this.equipes && this.equipes.length > 0);
        var filtrosCarregados : boolean = (this.filtros && this.filtros.length > 0);

        return equipesCarregadas && filtrosCarregados;
    }

    inibirControlesParaProvidencia(){
        this.cabecalhoCaixaTrabalhoService.observableInibirControlesCabecalho()
            .subscribe(inibir => {  
                this.inibirControlesCabecalho = inibir;
            });
    } 
}

class WidthCabecalho {
    widthContainer: number;
    widthAutocompleteEquipe: number;
    widthAutocompleteFiltro: number;
    widthCheckExibirTodas: number;
    widthCheckSemAgrupamento: number;
    widthCheckExibirApensados: number;

    private paddingDisponivel(caixaTrabalhoUsuario: boolean): number {
        return this.widthContainer -
            this.widthAutocompleteEquipe -
            this.widthAutocompleteFiltro -
            this.widthCheckSemAgrupamento -
            this.widthCheckExibirApensados -
            (caixaTrabalhoUsuario ? 0 : this.widthCheckExibirTodas);
    }

    cssPaddingCheckExibirTodas(caixaTrabalhoUsuario: boolean): string {
        return `0 ${caixaTrabalhoUsuario ? 0 : this.paddingDisponivel(false) / 4}px`;
    }

    cssPaddingCheckSemAgrupamento(caixaTrabalhoUsuario: boolean): string {
        return `0 ${caixaTrabalhoUsuario ? this.paddingDisponivel(true) / 3 - 3 : 0}px`;
    }

    cssPaddingCheckExibirApensados(caixaTrabalhoUsuario: boolean): string {
        if (caixaTrabalhoUsuario) {
            return `0 ${this.paddingDisponivel(true) / 3 - 3}px 0 0`;
        }
        return `0 ${this.paddingDisponivel(false) / 4}px`;
    }
}

