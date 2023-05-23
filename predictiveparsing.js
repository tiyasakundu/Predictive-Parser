var n = 0
function removeLeftRecursionEach(production, extra, n) {
    a = production[0]
    derives = production.slice(production.indexOf(">") + 1).split("|")
    betas = []
    alphas = []
    for(each of derives) {
        if(each[0] != a) {
            betas.push(each)
        } else {
            alphas.push(each.slice(1))
        }
    }
    if(betas.length == derives.length) {
        return [production]
    }
    ad = extra[window.n]
    window.n += 1
    s = a + "->"
    for(i of betas) {
        if(s[s.length - 1] != '>') {
            s += "|"
        }
        s += i + ad
    }
    s2 = ad + "->"
    for(i of alphas) {
        if(s2[s2.length - 1] != '>') {
            s2 += "|"
        }
        s2 += i + ad 
    }
    s2 += "|e"
    return [s, s2]
}

function removeLeftRecursion(cfg) {
    let alphabet = String.fromCharCode(...Array(123).keys()).slice(65);
    isPresent = {}
    extra = []
    for(i = 0; i < 26; i ++) {
        isPresent[alphabet[i]] = false
    }
    for(production of cfg) {
        isPresent[production[0]] = true
    }
    for(i = 0; i < 26; i ++) {
        if(isPresent[alphabet[i]] == false) {
            extra.push(alphabet[i])
        }
    }
    ans = []       
    for(production of cfg) {
        for(each of removeLeftRecursionEach(production, extra)) {
            ans.push(each)
        } 
    }
    return ans
}

// ---------------------------------- FIRST ------------------------

function isTerminal(c) {
    return !(c.match(/[A-Z]/))
}    

first = {}
vis = {}
derives = {}
terminals = []
function getFirst(c) {
    if(vis[c]) {
        return first[c]
    }
    if(isTerminal(c)) {
        vis[c] = true
        first[c].add(c)
        return first[c]
    }
    for(each of derives[c]) {
        ind = 0
        while(ind < each.length) {
            f = 0
            for(x of getFirst(each[ind])) {
                if(x == 'e') {
                    f = 1
                } else {
                    first[c].add(x)
                }
            }
            if(f == 0) {
                break
            }
            ind += 1
        }
        if(ind == each.length && f == 1) {
            first[c].add('e')
        }
    }
    vis[c] = true
    return first[c]
}

// ------------------------- FOLLOW ----------------------------------------

follow = {}
function getFollow(c) {
    if(vis[c]) {
        return follow[c]
    }
    vis[c] = true
    for(production of cfg) {
        for(d of derives[production[0]]) {
            for(ind = 0; ind < d.length; ind ++) {
                if(d[ind] != c) {
                    continue
                }
                ind += 1
                f = 1
                while(ind < d.length) {
                    f = 0
                    for(x of first[d[ind]]) {
                        if(x != 'e') {
                            follow[c].add(x)
                        } else {
                            f = 1
                        }
                    }
                    if(f == 0) {
                        break   
                    }
                    ind += 1
                }
                if(ind >= d.length && f == 1) {
                    for(x of getFollow(production[0])) {
                        follow[c].add(x)
                    }
                }
            }
        }
    }
    return follow[c]
}

// -------------------------- PRASE TABLE -------------------------

table = {}
function fillTable(c) {
    for(each of derives[c]) {
        ind = 0
        while(ind < each.length) {
            f = 0
            for(x of first[each[ind]]) {
                if(x == 'e') {
                    f = 1
                } else {
                    table[c + x] = each
                }
            }
            if(f == 0) {
                break
            }
            ind += 1
        }
        if(ind == each.length && f == 1) {
            for(x of follow[c]) {
                table[c + x] = each
            }
        }
    }
}

// --------------------------- DRAW ------------------------------

function drawStart(start, did) {
    tree = document.getElementById("tree")
    for(x of tree.childNodes) {
        tree.removeChild(x)
    }
    const ul = document.createElement("ul")
    const li = document.createElement("li")
    li.setAttribute("id", did)
    did += 1
    const a = document.createElement("a")
    a.setAttribute("href", "#")
    const div = document.createElement("div")
    div.setAttribute("class", "mx-auto")
    const divc = document.createElement("div")
    divc.setAttribute("class", "circle")
    const p = document.createElement("p")
    p.textContent = start
    divc.appendChild(p)
    div.appendChild(divc)
    a.appendChild(div)
    li.appendChild(a)
    ul.appendChild(li)
    tree.appendChild(ul)
}

function drawDerives(d, p, did) {
    tree = document.getElementById(p)
    const ul = document.createElement("ul")
    ul.setAttribute("class", "inn_line")
    color = "#000"
    did += d.length - 1
    for(x of d.reverse()) {
        if(isTerminal(x) && x != 'e') {
            color = "blue"
        } else {
            color = "black"
        }
        const li = document.createElement("li")
        li.setAttribute("id", did)
        const a = document.createElement("a")
        a.setAttribute("href", "#")
        const div = document.createElement("div")
        div.setAttribute("class", "mx-auto")
        const divc = document.createElement("div")
        divc.setAttribute("class", "circle")
        divc.style.background = color
        const p = document.createElement("p")
        p.textContent = x
        divc.appendChild(p)
        div.appendChild(divc)
        a.appendChild(div)
        li.appendChild(a)
        ul.appendChild(li)
        did -= 1
    }
    tree.appendChild(ul)
}

function printReject() {
    d = document.getElementById("verdict")
    d.innerHTML = `Rejected`
    d.style.background = "red"
}

function printAccept() {
    d = document.getElementById("verdict")
    d.innerHTML = `Accepted`
    d.style.background = "green"
}

function sleep(milliseconds) {
    let timeStart = new Date().getTime();
    while (true) {
      let elapsedTime = new Date().getTime() - timeStart;
      if (elapsedTime > milliseconds) {
        break;
      }
    }
}

function printProduction(x) {
    const d = document.getElementById("productions")
    const p = document.createElement("p")
    p.textContent = x
    d.appendChild(p)
    // sleep(5000);
}

function printcfg(cfg) {    
    const d = document.getElementById("leftrecur")
    d.innerHTML = ``
    const h = document.createElement("h5")
    h.innerHTML = "After Removing Left Recursion"
    d.appendChild(h)
    for(x of cfg) {
        const p = document.createElement("p")
        p.textContent = x
        d.appendChild(p)
    }
}

function printfirst(cfg, first) {
    const di = document.getElementById("firstdiv")
    di.innerHTML = ``
    const h = document.createElement("h5")
    h.innerHTML = "First"
    di.appendChild(h)
    const d = document.createElement("table");
    for(production of cfg) {
        const tr = document.createElement("tr")
        const td1 = document.createElement("td")
        const td2 = document.createElement("td")
        td1.innerHTML = production[0]
        s = "{"
        c = 0
        for(x of first[production[0]]) {
            s += x
            if(c < first[production[0]].size - 1) {
                s += ", "
            }
            c += 1
        }
        s += "}"
        td2.innerHTML = s
        tr.appendChild(td1)
        tr.appendChild(td2)
        d.appendChild(tr)
        di.appendChild(d)
    }
}

function printfollow(cfg, follow) {
    const di = document.getElementById("followdiv")
    di.innerHTML = ``
    const h = document.createElement("h5")
    h.innerHTML = "Follow"
    di.appendChild(h)
    const d = document.createElement("table");
    for(production of cfg) {
        const tr = document.createElement("tr")
        const td1 = document.createElement("td")
        const td2 = document.createElement("td")
        td1.innerHTML = production[0]
        s = "{"
        c = 0
        for(x of follow[production[0]]) {
            s += x
            if(c < follow[production[0]].size - 1) {
                s += ", "
            }
            c += 1
        }
        s += "}"
        td2.innerHTML = s
        tr.appendChild(td1)
        tr.appendChild(td2)
        d.appendChild(tr)
        di.appendChild(d)
    }
}

// ---------------------------- PARSE STRING -------------------------

function parse_string(s) {
    d = document.getElementById("productions")
    d.innerHTML = ``

    i = 0
    f = 0
    stack = ['$', start]
    didStack = [-1, 0]
    did = 0
    drawStart(start, did)
    did += 1
    while(i < s.length && stack.length > 0) {
        ch = stack.pop()
        chdid = didStack.pop()
        if(isTerminal(ch)) {
            if(ch == s[i]) {
                i = i + 1
            } else if(ch != 'e') {
                document.getElementById(chdid).a.div.div.style.background = "red";
                f = 1
                break
            } 
        } else {
            t = table[ch + s[i]]
            printProduction(ch + "->" + t)
            if(t.length == 0) {
                f = 1
                break
            }
            l = []
            temp = did
            for(j = t.length - 1; j >= 0; j --) {
                l.push(t[j])
                stack.push(t[j])
                didStack.push(temp)
                temp += 1
            }
            drawDerives(l, chdid, did)
            did = temp
            // console.log(ch, s[i], stack)
        }
    }
    if(f == 0 && i == s.length && stack.length == 0) {    
        printAccept()
        console.log('String is accepted')
    } else {
        printReject()
        console.log('String is not accepted')
    }
}

function parse(cfg, s, start) {
    window.first = {}
    window.vis = {}
    window.derives = {}
    window.terminals = []
    window.follow = {}
    window.table = {}
    window.n = 0

    cfg.pop()

    // REMOVE LEFT RECURSION
    cfg = removeLeftRecursion(cfg)
    printcfg(cfg);


    // CALCULATE FIRST
    derives = {}
    for(production of cfg) {
        derives[production[0]] = production.slice(3).split('|')
    }
    for(production of cfg) {
        for(x of production) {
            if(isTerminal(x)) {
                vis[x] = false
                first[x] = new Set()
            }
        }
        vis[production[0]] = false
        first[production[0]] = new Set()
    }
    terminals.push('$')
    for(production of cfg) {
        for(x of production) {
            if(isTerminal(x)) {
                vis[x] = true
                first[x] = x
                terminals.push(x)
            }
        }
        first[production[0]] = getFirst(production[0])
    }
    printfirst(cfg, first)
    // for(production of cfg) {
    //     console.log(production[0], first[production[0]])
    // }


    // CALCULATE FOLLOW
    for(production of cfg) {
        for(x of production) {
            if(isTerminal(x)) {
                vis[x] = false
                follow[x] = new Set()
            }
        }
        vis[production[0]] = false
        follow[production[0]] = new Set()
    }
    follow[start].add('$')
    for(production of cfg) {
        let ch = production[0]
        getFollow(ch)
        // console.log(ch, follow[ch])
    }
    printfollow(cfg, follow)


    // MAKE PARSE TABLE
    for(production of cfg) {
        for(x of terminals) {
            table[production[0] + x] = ''
        }
    }
    for(production of cfg) {
        fillTable(production[0])
    }
    // console.log(table)


    for(ch of s) {
        if(!terminals.includes(ch)) {
            alert("Characters in string dont match the terminals")
            return
        }
    }
    
    // PARSE THE STRING
    parse_string(s)

    
}

cfg = 'E->E+T|T T->TF|F F->F*|a|b'.split(' ')
s = 'a*b+a$'
start = 'E'
//parse(cfg, s, start)





function getInputValue() {
    numberOfPro = document.getElementById("exampleFormControlInput1").value;
    document.getElementById("proRules").innerHTML = ``
    //document.getElementById("exampleFormControlInput1").innerHTML = numberOfPro
    if(numberOfPro <= 0)
        alert("Number of Productions should be atleast one")
    else
        createTable();
}

function createTable() {
    let y = document.getElementById('table')
    y.innerHTML = ""
        
    let th = document.querySelectorAll('#table th');
    if (!th.length) {
        let rows = "<th>Production Number</th><th>Production lhs</th><th>Production rhs</th>";
        let table = document.createElement('table');
        table.innerHTML = rows;
        document.getElementById("table").appendChild(table.firstChild);
  
        for (let i = 1; i <= numberOfPro; i++) {
            let elems = '';
            elems += "<tr><td style='width:20%;'>" + i + "</td><td style='width:20%;'><input style='width:100%;' type='text' name='" + "prodlhs".concat(i) + "' id='" + "a".concat(i) + "'></td><td style='width:60%;'><input style='width:100%;' type='text' name='" + "prodrhs".concat(i) + "' id='" + "b".concat(i) + "'></td></tr>";
            let table = document.createElement('table');
            table.innerHTML = elems;
            document.getElementById("table").appendChild(table.firstChild);
        }
    }
    var button1 = document.createElement('button');
    button1.type = 'button';
    button1.innerHTML = 'Genreate Rules';
    button1.className = 'btn btn-outline-warning d-block mx-auto m-2';
    let container = document.getElementById("proRules")
    button1.onclick = function() {
        getProductions();
    }

    var button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = 'Generate Parse Tree';
    button.className = 'btn btn-info d-block mx-auto my-3';
    button.onclick = function() {
        getProductions();
        parse(cfg, s, start);
        return
    }

    var inputString = document.createElement('input')
    inputString.accept = 'text'
    inputString.placeholder = "Enter String to be Parsed"
    inputString.className = "form-control"
    inputString.id = "str1"

    container.appendChild(inputString)
    //container.appendChild(button1)
    container.appendChild(button)
}

function getProductions() {
    var productionRules = []
    let myTab = document.getElementById('table')
    parseString = document.getElementById('str1').value
    if(parseString.length == 0) {
        alert('Parse string cannot be empty')
    }
    // LOOP THROUGH EACH ROW OF THE TABLE AFTER HEADER.
    f = 0
    for (i = 1; i < myTab.rows.length; i++) {
        if(document.getElementById("a".concat(i)).value.length != 1 || document.getElementById("b".concat(i)).value.length == 0) {
            f = 1
            break
        }
        productionRules += document.getElementById("a".concat(i)).value + '->' + document.getElementById("b".concat(i)).value + ' ';
    }
    if(f) {
        alert('RHS should be of length 1 and LHS cannot be empty')
    }
    cfg = productionRules.split(' ')
    start = productionRules[0]
    s = parseString + '$'
}