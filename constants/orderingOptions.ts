export interface OrderingOption {
  id: number;
  name: string;
}

export const ORDERING_OPTIONS = [
  { id: 1, name: 'Melhor Avaliação' },
  { id: 2, name: 'Número de Avaliações' },
  { id: 3, name: 'Menor Preço' },
  { id: 4, name: 'Maior Preço' },
]
