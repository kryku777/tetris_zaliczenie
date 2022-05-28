//typ wyliczeniowy ENUM stworzony by przechowywac wszystkie akcje, ktore chcemy logowac do historii.
//zapisujac np GameAction.start zapisujemy rozpoczęcie gry.
//Wywolanie tego typu mozemy znalezc w game.component.ts
export enum GameAction {
    start = "Rozpoczęto grę", 
    pause = "Zatrzymano grę", 
    resume = "Wznowiono grę",
    restart = "Uruchomiono ponownie", 
    gameOver = "Koniec gry", 
    lineCleared = "Punkt zdobyty"
  }

/**
 * klasa HistoryEntry to jeden wiersz wpisu historii
 * Zawiera:
 * timestamp - data/czas wpisu
 * action - akcja czyli element typu wyliczeniowego GameAction
 * points - aktualna liczba punktow
*/
export class HistoryEntry {
    timestamp: Date;
    action: GameAction;
    points: number;

    /**
     * tworzac nowy obiekt HistoryEntry przekazujemy tylko akcje i punkty. Data jest zawsze ustawiana na aktualna 
     */
    constructor(act : GameAction, pts : number) {
        this.action = act;
        this.timestamp = new Date();
        this.points = pts;
    }
}
