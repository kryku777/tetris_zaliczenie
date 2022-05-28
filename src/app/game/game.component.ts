import { ThisReceiver } from '@angular/compiler';
import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { HostListener } from '@angular/core';
import { TetrisCoreComponent } from 'ngx-tetris';
import { GameAction, HistoryEntry } from '../history-entry';
import { Player } from '../player';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  
  // zmienna na liczbe punktow
  linesCleared = 0;

  // aktualny status
  status = 'READY';

  // zmienna na czas gry - w sekundach
  time: number = 0;

  //zmienna interwałowa do liczenia czasu
  interval;

  //czy gra jest aktualnie zatrzymana
  paused = true;

  //czy wyswietlic informacje o zakończeniu gry (przegrana)
  gameOverInfo = false;

  //style dla tablicy i statusu zmieniamy dynamicznie modyfikujac te zmienne
  // * jesli przegramy tablica koloruje sie na czerwono
  boardStyle = 'default';

  //ten kolor ustawiony jest podczas logowania i wracamy do niego przy kazdym rozpoczeciu gry
  currentColor = 'default';

  // * gdy pauzujemy gre napis statusu podswietla sie na czerwono
  statusStyle = 'white';

  // to jest tablica obiektow HistoryEntry przechowujaca kolejne akcje do wyswietlenia w tabeli
  history: HistoryEntry[] = [];

  //informacja o aktualnym graczu z serwisu
  currentPlayer: Player;

  /**
   * funkcja logujaca do historii wszystkie dzialania, zapisuje:
   * Typ akcji - zmienna typu GameAction (z pliku history-entry.ts)
   * Aktualna liczba punktow
   * Aktualna data/czas
   * */
  logAction(act: GameAction) {
    this.history.push(new HistoryEntry(act, this.linesCleared));
  }

  //gdy zdobedziemy punkt zwiekszamy liczbe punktow i logujemy akcje do historii
  onLineCleared() {
    this.linesCleared++;
    this.logAction(GameAction.lineCleared);
  }

  //gdy przegramy zatrzymujemy timer, wyswietlamy info o koncu gry i logujemy akcję
  onGameOver() {
    this.pauseTimer();
    this.gameOverInfo = true;
    this.boardStyle = 'game-over';
    this.logAction(GameAction.gameOver);
  }

  //gdy wychodzimy z gry wysylamy informacje o zmianie strony do komponentu rodzica
  gameExit() {
    this._router.navigate(['/intro']);
  }

  //funkcja startujaca zegar, resetuje liczba sekund i ustawia nowy interwał, który co 1000 ms (czyli sekunde) zwieksza licznik czasu
  startTimer() {
    this.resetTimer();
    this.paused = false;
    this.interval = setInterval(() => {
      if (!this.paused) {
        this.time++;
      }
    }, 1000);
  }

  // przestawiamy flagę gdy chcemy zatrzymac gre - to powstrzyma naliczanie czasu
  pauseTimer() {
    this.paused = true;
  }

  // przestawiamy flage gdy chcemy wznowic gre - to uruchomi naliczanie czasu
  restartTimer() {
    this.paused = false;
  }

  // resetujemy licznik czasu i interwał ktory go nalicza
  resetTimer() {
    this.time = 0;
    clearInterval(this.interval);
  }

  //w tym komponencie chcemy widziec zmienną game z komponentu gry Tetris ktory pobralismy
  @ViewChild(TetrisCoreComponent) game!: TetrisCoreComponent;

  // Aby moc reagowac na przyciski (strzałki, enter, esc) uzywamy HostListenera - znalezione w sieci i sprawdzamy document:keydown - czyli co zostalo wcisniete na klawiaturze
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //w zaleznosci od wcisnietego klawisza wywolujemy odpowiednie operacje na grze this.game.....
    switch (event.key) {
      case 'ArrowDown':
        this.game.actionDown();
        break;
      case 'ArrowLeft':
        this.game.actionLeft();
        break;
      case 'ArrowRight':
        this.game.actionRight();
        break;
      case 'ArrowUp':
        this.game.actionRotate();
        break;

      /**
       * ESCAPE słuzy do zatrzymywania i wznawiania gry
       * Jesli nie przegralismy to sprawdzamy aktualny status i odpowiednio pauzujemy albo wznawiamy gre, czyli:
       * zatrzymujemy/wznawiamy licznik czasu
       * zmieniamy status na START / STOP
       * zmieniamy styl statusu na czerwony / bialy
       * logujemy akcje by miec historie
       */
      case 'Escape':
        if (!this.gameOverInfo) {
          if (this.status == 'START') {
            this.pauseTimer();
            this.status = 'STOP';
            this.game.actionStop();
            this.logAction(GameAction.pause);
            this.statusStyle = 'red';
          } else if (this.status == 'STOP') {
            this.restartTimer();
            this.status = 'START';
            this.game.actionStart();
            this.logAction(GameAction.resume);
            this.statusStyle = 'white';
          }
        }
        break;

      /**
       * ENTER odpowiada za pierwsze rozpoczecie gry i RESTART
       * ustawiamy kolor planszy na domyslny (jesli wczesniej przegralismy jest czerwony)
       * ukrywamy ewentualne info o przegranej
       * logujemy akcje do historii
       * i w zaleznosci od tego czy to pierwszy start czy restart odpowiednio modyfikujemy licznik czasu i zaczynamy gre
       */
      case 'Enter':
        this.boardStyle = this.currentColor;
        this.gameOverInfo = false;
        this.logAction(GameAction.start);
        this.statusStyle = 'white';
        if (this.status == 'READY') {
          this.startTimer();
          this.status = 'START';
          this.game.actionStart();
          this.linesCleared = 0;
        } else {
          this.resetTimer();
          this.startTimer();
          this.status = 'START';
          this.game.actionStart();
          this.game.actionReset();
          this.linesCleared = 0;
        }
        break;

      default:
        break;
    }
    event.key;
  }
  constructor(public _storage: StorageService, private _router: Router, private _route: ActivatedRoute) {
    this.currentPlayer = this._storage.getPlayer();
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
        this.currentColor = params['color'] == '' ? 'default' : params['color'];
        this.boardStyle = this.currentColor;
    });
  }
}
