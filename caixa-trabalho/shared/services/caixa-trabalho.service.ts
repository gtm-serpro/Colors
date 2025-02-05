import { Injectable } from '@angular/core';
import { RestService } from "app/ngx/infra/shared/services/rest.service";
import { Observable, Observer } from 'rxjs/Rx';
import { IFiltroCaixaTrabalho } from 'main/ts/domain/IFiltroCaixaTrabalho';
import { Http, Jsonp } from '@angular/http';
import { IEquipeCaixaTrabalho } from '../../../../../main/ts/domain/IEquipeCaixaTrabalho';
import { IAtividade } from 'main/ts/domain/IAtividade';
import { ICaixaTrabalho } from '../../../../../main/ts/domain/ICaixaTrabalho';
import { IResultadoCaixaTrabalho } from '../../../../../main/ts/domain/IResultadoCaixaTrabalho';
import { IApensacao } from 'main/ts/domain/IApensacao';
import { IProcessoApoio } from '../../../../../main/ts/domain/IProcessoApoio';
import { ITotalizadorProcessosCaixaTrabalho } from 'main/ts/domain/ITotalizadorProcessosCaixaTrabalho';
import { IEquipeAtividade } from 'main/ts/domain/IEquipeAtividade';
import { IResultadoProvidenciaCaixaTrabalho } from '../../../../../main/ts/domain/IResultadoProvidenciaCaixaTrabalho';

@Injectable()
export class CaixaTrabalhoService extends RestService<IFiltroCaixaTrabalho>{

    urlAsp: string;

    constructor(protected http: Http, protected jsonp: Jsonp) {
        super(http, jsonp);
    }
    
    public getUrl(): string {
        return "caixaTrabalho"
    }

    public mapIdentificador(objeto: IFiltroCaixaTrabalho): string {
        return objeto.resourceId;
    }

    public setUrlAsp(urlAsp : string) {
        this.urlAsp = urlAsp;
    }

    public getUrlAsp(): string {
        return this.urlAsp;
    }

    obterFiltros() : Observable<IFiltroCaixaTrabalho[]> {
        return this.http.get(this.getUrlBase() + '/' + this.getUrl() + '/filtros', this.getDefaultRequestOptions()).map(response => response.json())
    }

    obterEquipes(todasEquipes:boolean) : Observable<IEquipeCaixaTrabalho[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/equipes/filtro', {todasEquipes : todasEquipes}, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterAtividades(caixaTrabalho:ICaixaTrabalho) : Observable<IAtividade[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/atividades/filtro', caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterProcessos(caixaTrabalho:ICaixaTrabalho) : Observable<IResultadoCaixaTrabalho[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/processos/filtro', caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterEquipeAtividadeProcesso(numeroProcesso:String) : Observable<IEquipeAtividade[]> {
        return this.http.get(this.getUrlBase() + '/' + this.getUrl() + '/processos/' + numeroProcesso + '/equipeAtividade', this.getDefaultRequestOptions()).map(response => response.json());
    }

    verificarParaClassificarACT(chaveEquipe: string, numeroEquipeAtividade: string, cpfUsuarioAtual: string, numerosLotes: string, numerosProcessosLotes: string) : Observable<any> {
        var url = `../ControleAcessarCaixaTrabalho.asp?psAcao=validaractprocesso&psChaveEquipe=${chaveEquipe}&psNumeroEquipeAtividade=${numeroEquipeAtividade}&cpfUsuario=${cpfUsuarioAtual}&psNumeroLote=${numerosLotes}&psNumerosProcesso=${numerosProcessosLotes}`;
        return this.requisitarPorJsonp(url);
    }

    verificarParaResponderFichaQuesitos(chaveEquipe: string, numeroEquipeAtividade: string, cpfUsuarioAtual: string, numerosLotes: string, numerosProcessosLotes: string) : Observable<any> {
        var url = `../ControleAcessarCaixaTrabalho.asp?psAcao=validarprocessopararesponderficha&psChaveEquipe=${chaveEquipe}&psNumeroEquipeAtividade=${numeroEquipeAtividade}&cpfUsuario=${cpfUsuarioAtual}&psNumerosProcesso=${numerosProcessosLotes}&psNumeroLote=${numerosLotes}`;
        return this.requisitarPorJsonp(url);
    }
    
    verificarAtribuirRelator(numerosProcessosLotes: string, cpfUsuarioAtual: string, chaveEquipe: string) : Observable<any> {
        var url = `../ControleChecarAlteracaoRelator.asp?psAcao=permitirAlterarRelatorEmPeloMenosUmProcesso&psDadosProcessos=${numerosProcessosLotes}&psCPF=${cpfUsuarioAtual}&psChaveEquipe=${chaveEquipe}`;
        return this.requisitarPorJsonp(url);
    }

    autoDistribuir(atribuirRelator: boolean, numerosProcessosLotes: string) {
        var url = `../ControleAcessarCaixaTrabalho.asp?psAcao=autoDistribuir&pbAtribuirRelator=${atribuirRelator}&psDadosProcesso=${numerosProcessosLotes}`;
        return this.requisitarPorJsonp(url);
    }
    
    
    obterApensados(numeroProcesso: string): Observable<IApensacao[]> {
        let url = `${this.getUrlBase()}/${this.getUrl()}/processos/${numeroProcesso}/apensados`;
        return this.http.get(url, this.getDefaultRequestOptions()).map(response => response.json());
    }  
    
    obterApensadosPrimeiroNivel(caixaTrabalho:ICaixaTrabalho) : Observable<IResultadoCaixaTrabalho[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/processos/filtro', caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterHorasEstimadas(caixaTrabalho:ICaixaTrabalho) : Observable<IProcessoApoio[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/processos/horasEstimadas/filtro', caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterTotalizadores(caixaTrabalho:ICaixaTrabalho) : Observable<ITotalizadorProcessosCaixaTrabalho> {
        let url = `${this.getUrlBase()}/${this.getUrl()}/processos/totalizadores/filtro`;
        return this.http.post(url, caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }  
    
    obterAtividadesProvidencias(caixaTrabalho:ICaixaTrabalho) : Observable<IAtividade[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/atividades/filtro', caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterProvidencias(caixaTrabalho:ICaixaTrabalho) : Observable<IResultadoProvidenciaCaixaTrabalho[]> {
        return this.http.post(this.getUrlBase() + '/' + this.getUrl() + '/providencia/filtro', caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    }

    obterTotalizadoresProvidencia(caixaTrabalho:ICaixaTrabalho) : Observable<ITotalizadorProcessosCaixaTrabalho> {
        let url = `${this.getUrlBase()}/${this.getUrl()}/providencia/totalizadores/filtro`;
        return this.http.post(url, caixaTrabalho, this.getDefaultRequestOptions()).map(response => response.json());
    } 
    
}
