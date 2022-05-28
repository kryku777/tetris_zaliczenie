import { Component, OnInit, Input } from '@angular/core';
import { HistoryEntry } from '../history-entry';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  //w tej zmiennej przechowujemy wpisy historii przekazane z komponentu rodzica (GameComponent)
  @Input() history : HistoryEntry[] = [];

  //w tej zmiennej przechowujemy frazę po której filtrujemy listę
  term = '';
  //w tej zmiennej przechowujemy aktualny kierunek sortowania
  order = 'ASC';

  //ta funkcja zmienia kierunek sortowania: ASC - rosnaco, DESC - malejaco
  toggleOrder() {
    this.order = (this.order == 'ASC') ? 'DESC' : 'ASC';
  }
  constructor() { }

  ngOnInit(): void {
  }

}
