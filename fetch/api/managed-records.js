import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";
// Your retrieve function plus any additional functions go here ...

const retrieve = obj => {
    const offset = formatOffset(obj);
    const color = formatColor(obj);
    const url = `${window.path}?limit=11${offset}${color}`;
    const prev = prevPage(obj);

    

    return fetch(url)
        .then(res => res.json())
        .then(data => {
            const next = nextPage(obj, data.length);
            if(data.length > 10) data.pop();
            const result = queryObj(data, prev, next);
            return result;
            
        })
        .catch(err => {
            console.log(err);
            return err;
        })
}

const prevPage = obj => {
    if(obj && obj.page > 1) {
        return obj.page - 1;
    } 
    return null;
}

const nextPage = (obj, size) => {
    if(obj && obj.page) {
        return size > 10 ? obj.page + 1 : null;
    } else {
        return size > 10 ? 2 : null;
    }
}

const formatOffset = obj => {
    let offset = "";

    if(obj && obj.page) {
        let page;
        if(obj.page > 1) {
            page = (obj.page - 1) * 10;
        } else {
            page = 0;
        }

        offset += `&offset=${page}`
    }
    return offset;
}


const formatColor = obj => {
    let colors = "";

    if(obj && obj.colors) {
        colors = obj.colors.map(color => {
            return `&color[]=${color}`
        }).join("");
    }

    return colors;
}

const findIDs = data => {
    return data.map(obj => obj.id);
}


const findOpen = data => {
    return data.filter(obj => obj.disposition === "open").map(obj => {
        if(isPrimaryColor(obj.color)) {
            obj.isPrimary = true;
        } else {
            obj.isPrimary = false
        }
        return obj;
    })
}

const findClosed = data => {
    return data.filter(obj => {
        return obj.disposition === "closed" && isPrimaryColor(obj.color);
    }).length;
}

const isPrimaryColor = color => {
    if(color === "red" || color === "yellow" || color === "blue") return true;
    return false;
}

const queryObj = (data, prevPage, nextPage) => {
    let hash = {
        "previousPage" : prevPage,
        "nextPage" : nextPage,
        "ids" : findIDs(data),
        "open" : findOpen(data),
        "closedPrimaryCount" : findClosed(data)
    }
    return hash;
}



export default retrieve;
