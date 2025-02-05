export class TotalizadorCaixaTrabalhoVM {
  numeroProcessosTotal: number = 0;
  numeroProcessosFiltrados: number = 0;
  numeroProcessosSelecionados: number = 0;
  minutosEstimadosTotal: number = 0;
  minutosEstimadosFiltrados: number = 0;
  minutosEstimadosSelecionados: number = 0;
  visible: boolean = false;
  ehProvidencia:boolean = false;

  setHorasEstimadasTotal(valor: string){
    if(valor){
      let tempo = valor.split(":");
      this.minutosEstimadosTotal = Number.parseInt(tempo[0]) * 60 + Number.parseInt(tempo[1]);
    }
  }

  addHorasEstimadasFiltrados(valor: string){
    if(valor){
      let tempo = valor.split(":");
      this.minutosEstimadosFiltrados += Number.parseInt(tempo[0]) * 60 + Number.parseInt(tempo[1]);
    }
  }
  
  addHorasEstimadasSelecionados(valor: string){
    if(valor){
      let tempo = valor.split(":");
      this.minutosEstimadosSelecionados += Number.parseInt(tempo[0]) * 60 + Number.parseInt(tempo[1]);
    }
  }

  private converterParaHorasEstimadasTotal(): string{
    let horas = Math.floor(this.minutosEstimadosTotal / 60);
    let minutos = this.minutosEstimadosTotal % 60;
    return horas.toString().padStart(2, "0").concat(":").concat(minutos.toString().padStart(2, "0"));
  }

  private converterParaHorasEstimadasFiltrados(): string{
    let horas = Math.floor(this.minutosEstimadosFiltrados / 60);
    let minutos = this.minutosEstimadosFiltrados % 60;
    return horas.toString().padStart(2, "0").concat(":").concat(minutos.toString().padStart(2, "0"));
  }

  private converterParaHorasEstimadasSelecionados(): string{
    let horas = Math.floor(this.minutosEstimadosSelecionados / 60);
    let minutos = this.minutosEstimadosSelecionados % 60;
    return horas.toString().padStart(2, "0").concat(":").concat(minutos.toString().padStart(2, "0"));
  }

  toString(removerTotal: boolean): string {
    var totalizador = "";

    if(!removerTotal) {
      if(this.ehProvidencia){
        totalizador = ` - Total / Filtradas / Selecionadas (${this.numeroProcessosTotal} / ${this.numeroProcessosFiltrados} / 
          ${this.numeroProcessosSelecionados} Providência(s) - ${this.converterParaHorasEstimadasTotal()} / 
          ${this.converterParaHorasEstimadasFiltrados()} / 
          ${this.converterParaHorasEstimadasSelecionados()} Hora(s) Estimada(s))`;
  
      }else{
        totalizador = ` - Total / Filtrados / Selecionados (${this.numeroProcessosTotal} / ${this.numeroProcessosFiltrados} / 
          ${this.numeroProcessosSelecionados} Processo(s) - ${this.converterParaHorasEstimadasTotal()} / 
          ${this.converterParaHorasEstimadasFiltrados()} / 
          ${this.converterParaHorasEstimadasSelecionados()} Hora(s) Estimada(s))`;
  
      }
    } else {
      if(this.ehProvidencia){
        totalizador = `Filtradas / Selecionadas (${this.numeroProcessosFiltrados} / 
          ${this.numeroProcessosSelecionados} Providência(s) - ${this.converterParaHorasEstimadasFiltrados()} / 
          ${this.converterParaHorasEstimadasSelecionados()} Hora(s) Estimada(s))`;
      }else{
        totalizador = `Filtrados / Selecionados (${this.numeroProcessosFiltrados} / 
          ${this.numeroProcessosSelecionados} Processo(s) - ${this.converterParaHorasEstimadasFiltrados()} / 
          ${this.converterParaHorasEstimadasSelecionados()} Hora(s) Estimada(s))`;
      }
    }

    return totalizador;
  }
}