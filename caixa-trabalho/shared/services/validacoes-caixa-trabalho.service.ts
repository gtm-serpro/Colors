import { IProcessoApoio } from "main/ts/domain/IProcessoApoio";
import { Inject, Injectable } from "@angular/core";
import { IUsuarioLogado } from "main/ts/domain/IUsuarioLogado";
import { UsuarioLogadoToken } from "main/ts/App";
import { UsuarioLogadoService } from "main/ts/seguranca/UsuarioLogadoService";
import { IProvidenciaCaixaTrabalho } from "main/ts/domain/IProvidenciaCaixaTrabalho";

@Injectable()
export class CaixaTrabalhoValidacoesService{

    private mensagemAlerta: string;
    private usuarioSupervisor: boolean;
    private agrupadoPorAtividade: boolean;
    
    constructor(@Inject(UsuarioLogadoToken) private usuarioLogado: IUsuarioLogado,
                @Inject(UsuarioLogadoService) private usuarioLogadoService: UsuarioLogadoService) {

    }

    private validarProcessoSelecionado(processosSelecionados: IProcessoApoio[]): boolean{
        if (processosSelecionados.length == 0){
            return false;
        }
        return true;
    }

    private validarProcessoApensado(processosSelecionados: IProcessoApoio[]): IProcessoApoio{
        return processosSelecionados.find(processo => {
            return processo.dadosFixosProcesso.indicadorProcessoApensado;
        });
    }

    private validarProcessoDistribuido(processosSelecionados: IProcessoApoio[]): IProcessoApoio{
        return processosSelecionados.find(processo => {
            return processo.dadosFixosProcesso.cpfResponsavelAtual != null;
        });
    }

    private validarProcessoNaoDistribuido(processosSelecionados: IProcessoApoio[]): IProcessoApoio{
        return processosSelecionados.find(processo => {
            return processo.dadosFixosProcesso.cpfResponsavelAtual == null;
        });
    }

    public atividadeNaoPermiteDistribuicao(processosSelecionados: IProcessoApoio[]): boolean{
        return this.validarAtividadeNaoPermiteDistribuicao(processosSelecionados);

    }

    private validarAtividadeNaoPermiteDistribuicao(processosSelecionados: IProcessoApoio[]): boolean{
        return processosSelecionados.some(processo => {
            return !processo.dadosFixosProcesso.equipeAtividadeAtual.indicadorPermiteAutoDistribuicao && !processo.dadosFixosProcesso.equipeAtividadeAtual.indicadorPermiteDistribuicaoPorQualquerMembro;
        });
    }
    
    private validarProcessoSigiloso(processosSelecionados: IProcessoApoio[]): boolean{
        return processosSelecionados.some(processo => {
            return processo.dadosFixosProcesso.indicadorProcessoSigiloso;
        });
    }

    private obterProcessoSigiloso(processosSelecionados: IProcessoApoio[]): IProcessoApoio{
        return processosSelecionados.find(processo => {
            return processo.dadosFixosProcesso.indicadorProcessoSigiloso;
        });
    }
    
    private validarUsuarioNaoResponsavelProcesso(processosSelecionados: IProcessoApoio[]): IProcessoApoio{
        var cpfUsuarioLogado: string = this.usuarioLogadoService.gerarCPFComDV(this.usuarioLogado.cpfUsuarioSemDV.toString(), false);
        return processosSelecionados.find(processo => {
            return processo.dadosFixosProcesso.cpfResponsavelAtual != cpfUsuarioLogado;
        });
    }

    private validarLimiteSelecaoProcesso(processosSelecionados: IProcessoApoio[], numeroMaximoSelecao: number): boolean{
        if (processosSelecionados.length > numeroMaximoSelecao){
            return false;
        }
        return true;
    }

    private validarAtividadesDistintasSelecionadas(processosSelecionados: IProcessoApoio[]): boolean{
        var idAtividade: number = processosSelecionados[0].dadosFixosProcesso.equipeAtividadeAtual.idAtividade;
        return processosSelecionados.some(processo => {
            return processo.dadosFixosProcesso.equipeAtividadeAtual.idAtividade != idAtividade;
        });
    }

    private validarProcessoContidoEmLote(processosSelecionados: IProcessoApoio[]): IProcessoApoio {
        return processosSelecionados.find(processo => {
            return processo.dadosFixosProcesso.idLoteAtual != null;
        });
    }

    private validarIndicadorProvidenciaPendenciaAtiva(processosSelecionados: IProcessoApoio[]): boolean {
        return processosSelecionados.some(processo => {
            return processo.dadosFixosProcesso.indicadorProvidenciacomPendenciaAtiva;
        });
    }

    private validarNomeGrupoProcessoAdministrativoJudicial(processosSelecionados: IProcessoApoio[]): boolean {
        return processosSelecionados.some(processo => {
            return processo.dadosFixosProcesso.nomeGrupoProcesso == null || processo.dadosFixosProcesso.nomeGrupoProcesso == "PROCESSO ADMINISTRATIVO/JUDICIAL";
        });
    }

    private validarProcessoDossieSelecionados(processosSelecionados: IProcessoApoio[]): boolean {
        var ehDossie: boolean = processosSelecionados.some(processo => {
            return processo.dadosFixosProcesso.indicadorDossie;
        });

        var ehProcesso: boolean = processosSelecionados.some(processo => {
            return !processo.dadosFixosProcesso.indicadorDossie;
        });

        if (ehDossie && ehProcesso){
            return true;
        }
        return false;        
    }

    public getUsuarioSupervisor():boolean{
        return this.usuarioSupervisor;
    }

    public setUsuarioSupervisor(usuarioSupervisor: boolean){
        this.usuarioSupervisor = usuarioSupervisor;
    }

    public getMensagemAlerta(): string{
        return this.mensagemAlerta;
    }

    public setAgruparPorAtividade(agruparPorAtividade: boolean){
        this.agrupadoPorAtividade = agruparPorAtividade;
    }
    
    public existeProcessoSelecionado(processosSelecionados: IProcessoApoio[]): boolean{
        if (!this.validarProcessoSelecionado(processosSelecionados)){
            this.mensagemAlerta = "Nenhum processo selecionado.";
            return false;
        }
        return true;
    }

    public existeProcessoApensado(processosSelecionados: IProcessoApoio[], mensagemGenerica?: boolean): boolean{
        var processoApensado: IProcessoApoio = this.validarProcessoApensado(processosSelecionados);
        if (processoApensado){
            var numeroProcessoFormatado: string = processoApensado.dadosFixosProcesso.numeroProcessoFormatado;
            if(mensagemGenerica) {
                this.mensagemAlerta = "A operação não pode ser realizada pois um ou mais processos estão juntados por apensação a outro processo.";
            } else {
                this.mensagemAlerta = "O processo " + numeroProcessoFormatado + " está juntado por apensação. Para realizar a operação deve ser selecionado apenas o processo principal.";
            }            
            return true;
        }
        return false;
    }

    public existeProcessoDistribuido(processosSelecionados: IProcessoApoio[]): boolean{
        var processoDistribuido: IProcessoApoio = this.validarProcessoDistribuido(processosSelecionados);
        if (processoDistribuido){
            var numeroProcesso: string = processoDistribuido.dadosFixosProcesso.numeroProcessoFormatado;
            var cpfResponsavel: string = processoDistribuido.dadosFixosProcesso.cpfResponsavelAtualFormatado;
            this.mensagemAlerta = "Processo " + numeroProcesso + " já está distribuído para o responsável: " + cpfResponsavel;
            return true;
        }
        return false;
    }

    public existeProcessoNaoDistribuido(processosSelecionados: IProcessoApoio[]): boolean{
        var processoNaoDistribuido: IProcessoApoio = this.validarProcessoNaoDistribuido(processosSelecionados);
        if (processoNaoDistribuido){
            var numeroProcesso: string = processoNaoDistribuido.dadosFixosProcesso.numeroProcessoFormatado;
            this.mensagemAlerta = "Processo " + numeroProcesso + " não está distribuído.";
            return true;
        }
        return false;
    }

    public atividadePermiteDistribuicao(processosSelecionados: IProcessoApoio[]): boolean{
        var atividadeNaoPermiteDistribuicao: boolean = this.validarAtividadeNaoPermiteDistribuicao(processosSelecionados);
        if (atividadeNaoPermiteDistribuicao && !this.usuarioSupervisor){
            this.mensagemAlerta = "Usuário sem permissão para auto-distribuir processo nesta atividade.";
            return false;
        }
        return true;
    }

    public atividadePermiteDistribuicaoDeProcessoNaoSigiloso(processosSelecionados: IProcessoApoio[]): boolean{
        var atividadeNaoPermiteDistribuicao: boolean = this.validarAtividadeNaoPermiteDistribuicao(processosSelecionados);
        var processoEhSigiloso: boolean = this.validarProcessoSigiloso(processosSelecionados);
        if (atividadeNaoPermiteDistribuicao && !this.usuarioSupervisor && !processoEhSigiloso){
            this.mensagemAlerta = "Usuário sem permissão para distribuir processo nesta atividade.";
            return false;
        }
        return true;
    }

    public existeProcessoSigilosoParaLiberacao(processosSelecionados: IProcessoApoio[]): boolean {
        return this.existeProcessoSigiloso(processosSelecionados, "O processo [numeroProcesso] possui nível de sigilo interno adicional. Não será possível liberá-lo, pois não poderá ficar sem responsável.");
    }

    public existeProcessoSigilosoParaInclusaoEmLote(processosSelecionados: IProcessoApoio[]): boolean {
        return this.existeProcessoSigiloso(processosSelecionados, "O processo [numeroProcesso] possui nível de sigilo interno adicional. Não será possível incluí-lo em um lote.");
    }

    public existeProcessoSigilosoParaSorteio(processosSelecionados: IProcessoApoio[]): boolean {
        return this.existeProcessoSigiloso(processosSelecionados, "O processo [numeroProcesso] possui nível de sigilo interno adicional. Não será possível sorteá-lo.");
    }
    
    public existeProcessoSigiloso(processosSelecionados: IProcessoApoio[], mensagem?: string): boolean {
        var processoSigiloso: IProcessoApoio = this.obterProcessoSigiloso(processosSelecionados);
        if (processoSigiloso){
            var numeroProcesso: string = processoSigiloso.dadosFixosProcesso.numeroProcessoFormatado;
            if(mensagem) {
                this.mensagemAlerta = mensagem.replace("[numeroProcesso]", numeroProcesso);
            } else {
                this.mensagemAlerta = "O processo " + numeroProcesso + " é sigiloso e não pode ser liberado.";
            }
            return true;
        }
        return false;
    }

    public usuarioPermissaoProcesso(processosSelecionados: IProcessoApoio[]): boolean{
        var processo: IProcessoApoio = this.validarUsuarioNaoResponsavelProcesso(processosSelecionados);
        if (processo && !this.usuarioSupervisor){
            var numeroProcesso: string = processo.dadosFixosProcesso.numeroProcessoFormatado;
            var cpfUsuarioLogado: string = this.usuarioLogadoService.gerarCPFComDV(this.usuarioLogado.cpfUsuarioSemDV.toString(), true);
            this.mensagemAlerta = "Usuário " +  cpfUsuarioLogado +  " não é responsável pelo processo " + numeroProcesso;
            return false;
        }
        return true;
    }

    public usuarioPermissaoProcessoSigilo(processosSelecionados: IProcessoApoio[]): boolean{
        var processo: IProcessoApoio = this.validarUsuarioNaoResponsavelProcesso(processosSelecionados);
        var processoEhSigiloso: boolean = this.validarProcessoSigiloso(processosSelecionados);
        if (processo && !this.usuarioSupervisor && !processoEhSigiloso){
            var numeroProcesso: string = processo.dadosFixosProcesso.numeroProcessoFormatado;
            var cpfUsuarioLogado: string = this.usuarioLogadoService.gerarCPFComDV(this.usuarioLogado.cpfUsuarioSemDV.toString(), true);
            this.mensagemAlerta = "Usuário " +  cpfUsuarioLogado +  " não é responsável pelo processo " + numeroProcesso;
            return false;
        }
        return true;
    }

    public usuarioNaoResponsavel(processosSelecionados: IProcessoApoio[]): boolean{
        var processo: IProcessoApoio = this.validarUsuarioNaoResponsavelProcesso(processosSelecionados);
        if (processo){
            var numeroProcesso: string = processo.dadosFixosProcesso.numeroProcessoFormatado;
            var cpfUsuarioLogado: string = this.usuarioLogadoService.gerarCPFComDV(this.usuarioLogado.cpfUsuarioSemDV.toString(), true);
            this.mensagemAlerta = "Usuário " +  cpfUsuarioLogado +  " não é responsável pelo processo " + numeroProcesso;
            return true;
        }
        return false;
    }
    
    public excedeuLimiteSelecaoProcesso(processosSelecionados: IProcessoApoio[], numeroMaximoSelecao: number, limitacaoTemporaria?: boolean): boolean{
        if (!this.validarLimiteSelecaoProcesso(processosSelecionados, numeroMaximoSelecao)){
            this.mensagemAlerta = "Selecione no máximo " + numeroMaximoSelecao + " processo" + (numeroMaximoSelecao === 1 ? '':'s') + " por vez.";
            
            if(limitacaoTemporaria) {
                this.mensagemAlerta += " OBS.: Esta limitação é temporária."
            }
            
            return true;
        }
        return false;
    }
    
    public atividadesDistintasSelecionadas(processosSelecionados: IProcessoApoio[]): boolean {
        if (this.validarAtividadesDistintasSelecionadas(processosSelecionados)){
            this.mensagemAlerta = "Todos os processos selecionados devem estar na mesma atividade.";
            return true;
        }
        return false;
    }

    public processoContidoEmLote(processosSelecionados: IProcessoApoio[]): boolean {
        var processoContidoLote: IProcessoApoio = this.validarProcessoContidoEmLote(processosSelecionados);
        if (processoContidoLote){
            var numeroProcesso: string = processoContidoLote.dadosFixosProcesso.numeroProcessoFormatado;
            var nomeLote: string = processoContidoLote.dadosFixosProcesso.nomeLote;
            this.mensagemAlerta = "Processo " + numeroProcesso + " contido no lote " + nomeLote + ". Selecione outro processo.";
            return true;
        }
        return false;
    }
    
    public processoAgrupadoPorAtividade(): boolean {
        if (!this.agrupadoPorAtividade){
            this.mensagemAlerta = "Para utilizar essa funcionalidade selecione a opção acima Agrupar por atividade.";
            return false;
        }
        return true;
    }

    public existeProvidenciaPendenciaAtivaInformar(processosSelecionados: IProcessoApoio[]): boolean{
        if (processosSelecionados.length == 1 && this.validarIndicadorProvidenciaPendenciaAtiva(processosSelecionados)){
            this.mensagemAlerta = "Já existe providência aberta para o processo.";
            return true;
        }
        return false;
    }

    public existeProvidenciaPendenciaAtivaFinalizarCancelar(processosSelecionados: IProcessoApoio[]): boolean{
        if (processosSelecionados.length == 1 && !this.validarIndicadorProvidenciaPendenciaAtiva(processosSelecionados)){
            this.mensagemAlerta = "Não existe providência aberta para o processo.";
            return true;
        }
        return false;
    }

    public nomeGrupoProcessoAdministrativoJudicialSigilo(processosSelecionados: IProcessoApoio[]) : boolean {
        if (this.validarNomeGrupoProcessoAdministrativoJudicial(processosSelecionados) && this.existeProcessoApensado(processosSelecionados, true)) {
            this.mensagemAlerta = "A operação não pode ser realizada pois um ou mais processos estão juntados por apensação a outro processo.";
            return true;
        }
        return false;
    }

    public apenasProcessoOuDossieSelecionados(processosSelecionados: IProcessoApoio[]): boolean {
        if (this.validarProcessoDossieSelecionados(processosSelecionados)) {
            this.mensagemAlerta = "Deve ser selecionado ou somente processo(s) ou somente dossiê(s).";
            return false;
        }
        return true;
    }

    public ehInstaciaProvidencia(prov:IProvidenciaCaixaTrabalho):boolean{
        return prov.idInstancia != null;
    }

    public validarOperacoesProvidenciasSelecionadas(providenciasSelecionadas: IProvidenciaCaixaTrabalho[], operacao: string): boolean{
        if(!this.temProvidenciaSelecionada(providenciasSelecionadas)){
            return false;
        }
        if(this.temAtividadesDistintasSelecionadas(providenciasSelecionadas)){
            this.mensagemAlerta = "Não é possível realizar a operação para providências em atividades distintas. Selecione apenas providências que se encontram na mesma atividade.";
            return false;
        };
        var atvProv: boolean = this.ehInstaciaProvidencia(providenciasSelecionadas[0]);
        // validações dependetes da operação
        switch (operacao) {
            case 'autoDistribuir':
                // precisa ser instância
                if(!atvProv){
                    this.mensagemAlerta = "Apenas providências com destino de tratamento definido podem ser distribuídas. Para distribuir o processo da providência utilize a aba Processos.";                
                    return false;    
                }
                // precisa estar liberada
                if(this.instanciaNaoLiberada(providenciasSelecionadas)){
                    this.mensagemAlerta = "Para auto distribuir a providência, a mesma precisa estar liberada e apenas o supervisor ou membros da equipe de tratamento podem realizar a operação, desde que a atividade possua configuração para permitir auto-distribuição.";                
                    return false;    
                }
                // precisa ser supervisor ou membro da equipe se permite auto-distribuição 
                if(!this.getUsuarioSupervisor() && !providenciasSelecionadas[0].permiteAutoDistribuicaoInstancia){
                    this.mensagemAlerta = "Para auto distribuir a providência, a mesma precisa estar liberada e apenas o supervisor ou membros da equipe de tratamento podem realizar a operação, desde que a atividade possua configuração para permitir auto-distribuição.";                
                    return false;    
                }
                break;
            case 'distribuir':
                // precisa ser instância
                if(!atvProv){
                    this.mensagemAlerta = "Apenas providências com destino de tratamento definido podem ser distribuídas. Para distribuir o processo da providência utilize a aba Processos.";                
                    return false;    
                }
                // precisa estar liberada
                if(this.instanciaNaoLiberada(providenciasSelecionadas)){
                    this.mensagemAlerta = "Para distribuir a providência, a mesma precisa estar liberada e o usuário deve ser supervisor da equipe de tratamento para realizar a operação ou membro da equipe de tratamento da providência se a atividade permitir distribuição por qualquer membro.";                
                    return false;    
                }
                // precisa ser supervisor ou membro da equipe se permite auto-distribuição 
                if(!this.getUsuarioSupervisor() && !providenciasSelecionadas[0].permiteDistribuicaoInstancia){
                    this.mensagemAlerta = "Para distribuir a providência, a mesma precisa estar liberada e o usuário deve ser supervisor da equipe de tratamento para realizar a operação ou membro da equipe de tratamento da providência se a atividade permitir distribuição por qualquer membro.";                
                    return false;    
                }
                break;
            case 'redistribuir': 
                // precisa ser instância
                if(!atvProv){
                    this.mensagemAlerta = "Apenas providências com destino de tratamento definido podem ser redistribuídas. Para redistribuir o processo da providência utilize a aba Processos.";                
                    return false;    
                }
                // precisa estar distribuída
                if(this.instanciaLiberada(providenciasSelecionadas)){
                    this.mensagemAlerta = "Para redistribuir a providência, a mesma precisa estar distribuída e apenas o responsável ou o supervisor da equipe podem realizar a redistribuição.";                
                    return false;    
                }
                // precisa ser responsável da instância ou supervisor da equipe
                if(this.naoResponsavelInstanciaProvidencia(providenciasSelecionadas) && !this.getUsuarioSupervisor()){
                    this.mensagemAlerta = "Para redistribuir a providência, a mesma precisa estar distribuída e apenas o responsável ou o supervisor da equipe podem realizar a redistribuição.";                
                    return false;    
                }
                break;
            case 'liberar':
                // precisa ser instância
                if(!atvProv){
                    this.mensagemAlerta = "Apenas providências com destino de tratamento definido podem ser liberadas. Para liberar o processo da providência utilize a aba Processos.";                
                    return false;    
                }
                // precisa estar distribuída
                if(this.instanciaLiberada(providenciasSelecionadas)){
                    this.mensagemAlerta = "Para liberar a providência, a mesma precisa estar distribuída e apenas o responsável ou o supervisor da equipe podem realizar a liberação.";                
                    return false;    
                }
                // precisa ser responsável da instância ou supervisor da equipe
                if(this.naoResponsavelInstanciaProvidencia(providenciasSelecionadas) && !this.getUsuarioSupervisor()){
                    this.mensagemAlerta = "Para liberar a providência, a mesma precisa estar distribuída e apenas o responsável ou o supervisor da equipe podem realizar a liberação.";                
                    return false;    
                }
                break;
            case 'movimentar':
                // precisa ser instância
                if(!atvProv){
                    this.mensagemAlerta = "Apenas providências com destino de tratamento definido podem ser movimentadas. Para movimentar o processo da providência utilize a aba Processos.";                
                    return false;    
                }
                // se instancia distribuida, precisa ser responsável da instância ou supervisor da equipe
                if(this.distribuidaNaoResponsavelInstanciaProvidencia(providenciasSelecionadas) && !this.getUsuarioSupervisor()){
                    this.mensagemAlerta = "Um destino de tratamento de providência distribuído só pode ser movimentado pelo responsável ou pelo supervisor da equipe de tratamento da providência.";                
                    return false;    
                }
                break;
            case 'finalizar':
            case 'cancelar':
                if(atvProv){
                    // providencia com instância, valida responsável da instância/processo 
                    //ou supervisor equipe instância
                    if(this.naoResponsavelInstanciaProvidencia(providenciasSelecionadas) && 
                        this.naoResponsavelProcessoProvidencia(providenciasSelecionadas) &&
                        !this.getUsuarioSupervisor()){
                        this.mensagemAlerta = "Apenas o responsável pelo processo, o responsável no destino de tratamento da providência ou o supervisor da equipe do destino podem finalizar/cancelar destino da providência.";                
                        return false;
                    }              
                }else{        
                    // precisa ser responsável pelo processo
                    if(this.naoResponsavelProcessoProvidencia(providenciasSelecionadas)){
                        this.mensagemAlerta = "Apenas o responsável pelo processo pode finalizar/cancelar providência.";
                        return false;
                    }
                }   
                break;
            default:
                this.mensagemAlerta = "Operação inválida!";
                break;
        }
        return true;
    }

    public temProvidenciaSelecionada(providenciasSelecionadas: IProvidenciaCaixaTrabalho[]):boolean{
        if(providenciasSelecionadas.length == 0){
            this.mensagemAlerta = "Selecione pelo menos uma providência para realizar a operação!";
            return false;
        }
        return true;
    }

    public temAtividadesProcessoDistintasSelecionadas(providenciasSelecionadas: IProvidenciaCaixaTrabalho[]): boolean{
        if(this.atividadesProcessoDiferentesSelecionadas(providenciasSelecionadas)){
            this.mensagemAlerta = "Não é possível realizar a operação para processos em atividades distintas. Selecione apenas providências cujos processos se encontram na mesma atividade.";
            return true;
        };
        return false;
    }

    public temPerfilAssociarFatorDeAjusteHE(): boolean {
        if (!this.possuiPerfilAssociarFatorDeAjusteHE()){
            this.mensagemAlerta = "Usuário não tem perfil registrado no sistema SenhaSIEF para acessar esta operação. Procure o cadastrador da sua região.";
            return true;
        }
        return false;
    }    

    private temAtividadesDistintasSelecionadas(providenciasSelecionadas: IProvidenciaCaixaTrabalho[]): boolean{
        var idAtividade: number = providenciasSelecionadas[0].idAtividadeInstancia;
        return providenciasSelecionadas.some(providencia => {
            return providencia.idAtividadeInstancia != idAtividade;
        });
    }

    private atividadesProcessoDiferentesSelecionadas(providenciasSelecionadas: IProvidenciaCaixaTrabalho[]): boolean{
        var idAtividade: number = providenciasSelecionadas[0].equipeAtividadeAtualProcesso.idAtividade;
        return providenciasSelecionadas.some(providencia => {
            return providencia.equipeAtividadeAtualProcesso.idAtividade != idAtividade;
        });
    }

    public naoResponsavelInstanciaProcessoProvidencia(providencias: IProvidenciaCaixaTrabalho[]):boolean{
        if(this.naoResponsavelInstanciaProvidencia(providencias) && this.naoResponsavelProcessoProvidencia(providencias)){
            this.mensagemAlerta = "Usuário precisa ser o responsável pelo processo ou pelo destino da providência para realizar a operação.";
            return true;
        }
        return false;
    }

    private naoResponsavelInstanciaProvidencia(providencias: IProvidenciaCaixaTrabalho[]): boolean{
        return providencias.some(providencia => {
                return providencia.cpfResponsavelInstancia != this.usuarioLogado.cpfUsuarioSemDV;
            });        
    }

    private naoResponsavelProcessoProvidencia(providencias: IProvidenciaCaixaTrabalho[]): boolean{
        return providencias.some(providencia => {
                return providencia.cpfResponsavelAtual != this.usuarioLogadoService.gerarCPFComDV(this.usuarioLogado.cpfUsuarioSemDV.toString(), false);    
            });        
    }

    public instanciaNaoLiberada(providencias: IProvidenciaCaixaTrabalho[]): boolean{
        return providencias.some(providencia => {
                return providencia.cpfResponsavelInstancia != null;    
            });        
    }

    private instanciaLiberada(providencias: IProvidenciaCaixaTrabalho[]): boolean{
        return providencias.some(providencia => {
                return providencia.cpfResponsavelInstancia == null;    
            });        
    }

    private distribuidaNaoResponsavelInstanciaProvidencia(providencias: IProvidenciaCaixaTrabalho[]): boolean{
        return providencias.some(providencia => {
                return providencia.cpfResponsavelInstancia != null 
                        && providencia.cpfResponsavelInstancia != this.usuarioLogado.cpfUsuarioSemDV;
            });        
    }

    private possuiPerfilAssociarFatorDeAjusteHE() {
        return this.usuarioLogadoService.habilitado('EPROA139');
      }    
    
}