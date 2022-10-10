
import {useState, useEffect} from 'react'


const SERVER_URL = "http://localhost:8080";
const img = require('./assets/black-queen.png')
export default function ChessBoard() : JSX.Element {
    const [chessBoard, setChessBoard] = useState(new Map<string, string>());
  
    useEffect (() => fetchBoard(), []);
  
    function fetchBoard(): void {
      const out = fetch(SERVER_URL, { method:'GET' })
        .then(res => res.json())
        .then(jsonToMap)
        .then(setChessBoard);
    }
  
    function requestMove(e: React.MouseEvent<HTMLDivElement>) {
      const row = Math.floor(e.clientY / 100);
      const col = Math.floor(e.clientX / 100);
      console.log(row, col, getPositionString(row,col));
      fetch(SERVER_URL, {
        method : "POST",
        mode: "no-cors",
        headers: {'Content-Type': 'application/json'},
        body : getPositionString(row, col),
      }).then( res => console.log("POST response : "+res.status));
      fetchBoard();
    }
    const boardRows : JSX.Element[] = Array(8);
    for (let i = 0; i < 8; i++) {
      const rowCells : JSX.Element[] = Array(8);
      for (let j = 0; j < 8; j++) {
        const currPosition = getPositionString(j, i);
        if (chessBoard.has(currPosition)){
          const currCellRep = chessBoard.get(currPosition) as string;
          
          rowCells[j] = <div key={currPosition} className='gridCell' style={{backgroundImage:`url(/assets/${currCellRep}.png)` }}>
            
            </div>
            continue;
        }
        rowCells[j] = <div key={currPosition} className='gridCell' onClick={requestMove}></div>;
      }
      boardRows[i] = <div key={i+""} className='boardRow'>{rowCells}</div>;
    }
    return <div className='board'>{boardRows}</div>;
  }
  
  type boardEntry = {
    row : number;
    col : number;
    name: string;
  }
  
  function jsonToMap(board : {}): Map<string, string> {
    const out : Map<string, string> = new Map();
    const entries = Object.entries<boardEntry>(board);
    entries.map((entry) => {
      const [name, e] = entry;
      const pos = getPositionString(e.row, e.col);
      out.set(pos, e.name);
    })
    console.log(board);
    console.log(out)
    return out;
  }
  
  function getPositionString(row : number, col : number): string{
    return row+"-"+col;
  }