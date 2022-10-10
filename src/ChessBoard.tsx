
import {useState, useEffect} from 'react'


const SERVER_URL = "http://localhost:8080";

export default function ChessBoard() : JSX.Element {
    const [chessBoard, setChessBoard] = useState(new Map<string, string>());
    const [selected, setSelected] = useState("");
    const [moves, setMoves] = useState([] as string[]);

    useEffect (() => fetchBoard(), []);
  
    function fetchBoard(): void {
      fetch(SERVER_URL+'/pieces', { method:'GET' })
      .then(res => res.json())
      .then(jsonToMap)
      .then(setChessBoard);
    }
  
    function handleClick(e: React.MouseEvent<HTMLDivElement>): void {
      const row = Math.floor(e.clientY / 100);
      const col = Math.floor(e.clientX / 100);
      console.log(row, col , selected)
      if (selected.length > 0) {
        postMove(row, col);
        return;
      }
      getMoves(row, col);
    }

    
    function getMoves(row: number, col: number) {
      fetch(SERVER_URL+'/moves'+getPositionString(row, col), { method : "GET"})
      .then(res => res.json())
      .then(res => jsonToList(res))
      .then((res) => {
        if (res.length > 0) {
            console.log(res);
            setSelected(getPositionString(row, col));
            setMoves(res);
          }
        });
        
    }

    function postMove(row: number, col: number) {
      fetch(SERVER_URL+'/move', {
        method : "POST",
        mode: "no-cors",
        headers: {'Content-Type': 'application/json'},
        body : selected + "," + getPositionString(row, col),
      })
      .then(res => {
        console.log("post respone: " + res.statusText);
        setMoves([]);
        setSelected("");
        fetchBoard();
      });

    }


    const boardRows : JSX.Element[] = Array(8);
    for (let i = 0; i < 8; i++) {
      const rowCells : JSX.Element[] = Array(8);
      for (let j = 0; j < 8; j++) {
        const currPosition = getPositionString(j, i);
        const style = {
          "backgroundImage" : "",
          "backgroundColor" : "",
        }

        if (chessBoard.has(currPosition)){
          const currCellRep = chessBoard.get(currPosition) as string;
          style["backgroundImage"] = `url(/assets/${currCellRep}.png)`;
        }

        if (currPosition === selected) {
          style["backgroundColor"] = "red";
        }

        if (moves.includes(currPosition)){
          style["backgroundColor"] = "green";
        }

        rowCells[j] = <div key={currPosition} className='gridCell' style={style} onClick={handleClick}></div>;
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
  
  function jsonToMap(input : {}): Map<string, string> {
    const out : Map<string, string> = new Map();
    const entries = Object.entries<boardEntry>(input);
    entries.map((entry) => {
      const [name, e] = entry;
      const pos = getPositionString(e.row, e.col);
      out.set(pos, e.name);
    })
    return out;
  }
  
  function jsonToList(input : {}): string[] {
    console.log(input);
    const out : string[] = []
    const entries = Object.entries<boardEntry>(input);
    entries.map((entry) => {
      const [name, e] = entry;
      const pos = getPositionString(e.row, e.col);
      out.push(pos);
    })
    return out;
  }

  function getPositionString(row : number, col : number): string{
    return row+"-"+col;
  }