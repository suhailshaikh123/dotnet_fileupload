onCopy(){
    this.copyregion = [];
    if(this.region.length > 0){
        this.draw();
        this.gridEvents.draw_region();
        this.copyregion = this.region;
        if(this.timer !== null){
            clearInterval(this.timer);
            this.timer = null;
        }

    }else if(this.columnselection.length > 0){
        this.draw();
        if(this.rowselection.length === 0)this.columnEvents.draw_selectedcols();
        this.columnselection.forEach(col => {
            this.copyregion.push(...Object.values(this.columns[col].cells));
        });
    }else if(this.rowselection.length > 0){
        this.draw();
        if(this.columnselection.length === 0)this.rowEvents.draw_selectedrows();
        this.rowselection.forEach(row => {
            this.copyregion.push(...Object.values(this.rows[row].cells));
        });
    }else if(this.activecell){
        this.draw();
        this.activecell.draw();
        this.copyregion = [this.activecell];
    }
    if(this.timer !== null){
        clearInterval(this.timer);
        this.timer = null;
    }
    this.draw_copy_region();
    this.copy_text_to_clipboard();
}

onPaste(){
    if(this.activecell){
        let selectionText;
        let selection = [];
        navigator.clipboard.readText().then(text => {
            text = text.replace("\r","");
            selectionText = text;
        }).catch(() => {
            selectionText = "";
        }).finally(() =>{
            selection = selectionText.split("\n");
            for(let index=0;index < selection.length;index++){
                selection[index] = selection[index].split("\t");
            }
            let selectionrowrange = selection.length;
            let selectioncolrange = selection[0].length;
            let activecell = [];
            if(this.region.length > 0){
                let initialrow  = this.region[0].row.index;
                let initialcol = this.region[0].column.index;
                let finalrow = initialrow;
                let finalcol = initialcol;
                this.region.forEach(cell => {
                    initialrow = Math.min(cell.row.index,initialrow);
                    initialcol = Math.min(cell.column.index,initialcol);
                    finalrow = Math.max(cell.row.index,finalrow);
                    finalcol = Math.max(cell.column.index,finalcol);
                });
                let cell;
                for(let rowindex = 0;rowindex <= finalrow - initialrow - selectionrowrange + 1; rowindex+= selectionrowrange){
                    for(let colindex = 0;colindex <= finalcol - initialcol - selectioncolrange + 1;colindex += selectioncolrange){
                        if(!this.rows.hasOwnProperty(initialrow + rowindex)){
                            let row = new Row(initialrow + rowindex,
                                this.x,
                                this.rows[initialrow + rowindex-1].y + this.rows[initialrow + rowindex-1].cellHeight,
                                this.cellWidth,
                                this.cellHeight,
                                this.canvas,
                                this.rowcanvas);
                            this.rows[initialrow + rowindex] = row;
                        }
                        if(!this.columns.hasOwnProperty(initialcol + colindex)){
                            let col = new Column(initialcol + colindex,
                                this.columns[initialcol + colindex - 1].x + this.columns[initialcol + colindex - 1].cellWidth,
                                this.y,
                                this.cellWidth,
                                this.cellHeight,
                                this.canvas,
                                this.columncanvas);
                            this.columns[initialcol + colindex] = col;
                        }
                        cell = this.rows[initialrow + rowindex].getCell(initialcol + colindex)?this.rows[initialrow + rowindex].getCell(initialcol + colindex):Cell.createCell(this.rows[initialrow + rowindex],this.columns[initialcol + colindex]);
                        activecell.push(cell);
                       
                    }
                }
                if(!(activecell.includes(this.rows[initialrow].getCell(initialcol)))){
                    activecell.push(this.rows[initialrow].getCell(initialcol));
                }
               
            }else if(this.columnselection.length > 0){
                let initialrow  = 1;
                let initialcol = this.columnselection[0];
                let finalrow = Object.keys(this.rows).length;
                let finalcol = initialcol;
                this.columnselection.forEach(col => {
                    initialcol = Math.min(col,initialcol);
                    finalcol = Math.max(col,finalcol);
                });
                for(let rowindex = 0;rowindex <= finalrow - initialrow - selectionrowrange + 1; rowindex+= selectionrowrange){
                    for(let colindex = 0;colindex <= finalcol - initialcol - selectioncolrange + 1;colindex += selectioncolrange){
                        activecell.push(this.rows[initialrow + rowindex].getCell(initialcol + colindex)?this.rows[initialrow + rowindex].getCell(initialcol + colindex):Cell.createCell(this.rows[initialrow + rowindex],this.columns[initialcol + colindex]));
                    }
                }
                if(!(activecell.includes(this.rows[initialrow].getCell(initialcol)))){
                    activecell.push(this.rows[initialrow].getCell(initialcol));
                }
            }else if(this.rowselection.length > 0){
                let initialcol  = 1;
                let initialrow = this.rowselection[0];
                let finalcol = Object.keys(this.columns).length;
                let finalrow = initialrow;
                this.rowselection.forEach(row => {
                    initialrow = Math.min(row,initialrow);
                    finalrow = Math.max(row,finalrow);
                });
                for(let rowindex = 0;rowindex <= finalrow - initialrow - selectionrowrange + 1; rowindex+= selectionrowrange){
                    for(let colindex = 0;colindex <= finalcol - initialcol - selectioncolrange + 1;colindex += selectioncolrange){
                        activecell.push(this.rows[initialrow + rowindex].getCell(initialcol + colindex)?this.rows[initialrow + rowindex].getCell(initialcol + colindex):Cell.createCell(this.rows[initialrow + rowindex],this.columns[initialcol + colindex]));
                    }
                }
                if(!(activecell.includes(this.rows[initialrow].getCell(initialcol)))){
                    activecell.push(this.rows[initialrow].getCell(initialcol));
                }
            }else{
                activecell.push(this.activecell);
            }
            this.reset();
            activecell.forEach(cell => {
                this.paste_selection(cell,selection);
            })
        });
    }
}

/**
 *
 * @param {Cell} activecell
 * @param {Array<String>} selection
 */

paste_selection(activecell , selection){
    let initialrow = activecell.row.index;
    let initialcol = activecell.column.index;
    let rowcount = selection.length;
    let colcount = selection[0].length;
    let cell;
    for(let rowoffset = 0;rowoffset < rowcount;rowoffset++){
        for(let columnoffset = 0;columnoffset < colcount;columnoffset++){
            if(!this.rows.hasOwnProperty(initialrow + rowoffset)){
                let row = new Row(initialrow + rowoffset,
                    this.x,
                    this.rows[initialrow + rowoffset-1].y + this.rows[initialrow + rowoffset-1].cellHeight,
                    this.cellWidth,
                    this.cellHeight,
                    this.canvas,
                    this.rowcanvas);
                this.rows[initialrow + rowoffset] = row;
            }
            if(!this.columns.hasOwnProperty(initialcol + columnoffset)){
                let col = new Column(initialcol + columnoffset,
                    this.columns[initialcol + columnoffset - 1].x + this.columns[initialcol + columnoffset - 1].cellWidth,
                    this.y,
                    this.cellWidth,
                    this.cellHeight,
                    this.canvas,
                    this.columncanvas);
                this.columns[initialcol + columnoffset] = col;
            }
            cell = this.rows[initialrow + rowoffset].getCell(initialcol + columnoffset)?this.rows[initialrow + rowoffset].getCell(initialcol + columnoffset):Cell.createCell(this.rows[initialrow + rowoffset],this.columns[initialcol + columnoffset]);
            cell.text = selection[rowoffset][columnoffset]?selection[rowoffset][columnoffset]:"";
            this.region.push(cell);
        }
    }
    this.draw();
}

copy_text_to_clipboard(){
    if(this.copyregion.length > 0){
        let initialrow = this.copyregion[0].row.index;
        let initialcol = this.copyregion[0].column.index;
        let finalrow = this.copyregion[0].row.index;
        let finalcol = this.copyregion[0].column.index;
        this.copyregion.forEach(cell => {
            initialrow = Math.min(cell.row.index,initialrow);
            initialcol = Math.min(cell.column.index,initialcol);
            finalrow = Math.max(cell.row.index,finalrow);
            finalcol = Math.max(cell.column.index,finalcol)
        });
        let outstring = "";
        for(let row = initialrow;row <= finalrow ; row++){
            for(let col = initialcol;col <= finalcol;col++){
                if(this.rows[row] && this.columns[col] && this.rows[row].cells && this.rows[row].cells.hasOwnProperty(col))
                ou
                otstring = outstring.concat(this.rows[row].getCell(col).text);utstring = outstring.concat("\t")
            }
            outstring = outstring.concat("\n");
        }
        outstring = outstring.replace("\t\n","\n");
        outstring = outstring.substring(0,outstring.length - 1);
        navigator.clipboard.writeText(outstring);
    }
}
