import { Injectable } from '@angular/core';
import { IColunaCaixaTrabalho } from "main/ts/domain/IColunaCaixaTrabalho";
import { Subject } from "rxjs/Subject";
import { IAtividade } from 'main/ts/domain/IAtividade';
import { Observable, BehaviorSubject } from 'rxjs';
import { IFiltroCaixaTrabalho } from 'main/ts/domain/IFiltroCaixaTrabalho';
import { IEquipeCaixaTrabalho } from 'main/ts/domain/IEquipeCaixaTrabalho';
import { TipoCaixaTrabalhoEnum } from 'app/ngx/shared/models/enums/tipo-caixa-trabalho-enum';

export interface ISelecaoCabecalho {
    equipeSelecionada : IEquipeCaixaTrabalho, 
    filtroSelecionado : IFiltroCaixaTrabalho, 
    agrupadoPorAtividade : boolean,
    exibirApensados : boolean
}

@Injectable()
export class CabecalhoCaixaTrabalhoService {

    private tipoCaixa: TipoCaixaTrabalhoEnum;
    private subjectCarregarAtividadesProcessos = new Subject<ISelecaoCabecalho>();
    private subjectLimparComboEquipe = new Subject<void>();
    private subjectLimparComboFiltro = new Subject<void>();
    private subjectExibirCabecalho = new BehaviorSubject<boolean>(false);
    private subjectSelecionarEquipe = new BehaviorSubject<string>(undefined);
    private subjectSelecionarAtividade = new BehaviorSubject<string>(undefined);
    private subjectInibirControlesCabecalho = new BehaviorSubject<boolean>(false);
    
    observableExibirCabecalho(): Observable<boolean> {
        return this.subjectExibirCabecalho.asObservable();
    }
    
    setExibirCabecalho(exibir : boolean) {
        this.subjectExibirCabecalho.next(exibir);
    }

    observableSelecionarEquipe() : Observable<string> {
        return this.subjectSelecionarEquipe.asObservable().take(1);
    }

    setSelecaoEquipe(resourceIdEquipe: string) {
        this.subjectSelecionarEquipe.next(resourceIdEquipe);
    }

    observableSelecionarAtividade() : Observable<string> {
        return this.subjectSelecionarAtividade.asObservable().take(1);
    }

    setSelecaoAtividade(resourceIdAtividade: string) {
        this.subjectSelecionarAtividade.next(resourceIdAtividade);
    }

    limparComboEquipe(){
        this.subjectLimparComboEquipe.next();
    }

    limparComboFiltro(){
        this.subjectLimparComboFiltro.next();
    }

    observableLimparComboEquipe(): Observable<void>{
        return this.subjectLimparComboEquipe.asObservable();
    }

    observableLimparComboFiltro(): Observable<void>{
        return this.subjectLimparComboFiltro.asObservable();
    }

    public carregarAtividadesProcesso(atividades : ISelecaoCabecalho) {
        this.subjectCarregarAtividadesProcessos.next(atividades);
    }

    public getCarregarAtividadesProcesso() : Observable<ISelecaoCabecalho> {
        return this.subjectCarregarAtividadesProcessos.asObservable();
    }

    set tipoCaixaTrabalho(tipoCaixaTrabalhoEnum: TipoCaixaTrabalhoEnum) {
        this.tipoCaixa = tipoCaixaTrabalhoEnum;
    }

    get tipoCaixaTrabalho() : TipoCaixaTrabalhoEnum {
        return this.tipoCaixa;
    }

    observableInibirControlesCabecalho(): Observable<boolean> {
        return this.subjectInibirControlesCabecalho.asObservable();
    }
    
    setInibirControlesCabecalho(inibir : boolean) {
        this.subjectInibirControlesCabecalho.next(inibir);
    }

}