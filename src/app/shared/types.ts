export interface BreakfastItem {
  id: string;
  name: string;
  brought: boolean;
}

export interface Participant {
  id: string;            
  name: string;
  cpf: string;
  breakfastDate: string;   
  items: BreakfastItem[];
}
