from utilities import *

extra = []
n = 0

def removeLeftRecursionEach(production):
    a = production[0]
    derives = production[production.index(">") + 1:].split("|")
    betas = []
    alphas = []
    for each in derives:
        if each[0] != a:
            betas.append(each)
        else:
            alphas.append(each[1:])
    if len(betas) == len(derives):
        return [production]
    global n
    ad = extra[n]
    n += 1
    s = a + "->" + "|".join((i + ad) for i in betas)
    s2 = ad + "->" + "|".join((i + ad) for i in alphas) + "|e"
    return [s, s2]

def removeLeftRecursion(cfg):
    isPresent = defaultdict(lambda: False)
    for production in cfg:
        isPresent[production[0]] = True
    for c in range(ord('A'), ord('Z') + 1):
        if isPresent[chr(c)] == False:
            extra.append(chr(c))
    ans = []       
    for production in cfg:
        for each in removeLeftRecursionEach(production): 
            ans.append(each)
    return ans

#------------------------------ GET FIRST------------------------

def isTerminal(c):
    return not (ord(c) >= ord('A') and ord(c) <= ord('Z'))

first = defaultdict(lambda: set())
vis = defaultdict(lambda: False)
derives = dict()
terminals = []
def getFirst(c):
    if vis[c]:
        return first[c]
    if isTerminal(c):
        vis[c] = True
        first[c].add(c)
        return first[c]
    
    for each in derives[c]:
            ind = 0
            while(ind < len(each)):
                f = 0
                for x in getFirst(each[ind]):
                    if x == 'e':
                        f = 1
                    else:
                        first[c].add(x)
                if f == 0:
                    break
                ind += 1
            if ind == len(each) and f == 1:
                first[c].add('e')
    vis[c] = True
    return first[c]

# ---------------------------- GET FOLLOW -------------------------------


follow = defaultdict(lambda: set())
def getFollow(c):
    if vis[c]:
        return follow[c]
    vis[c] = True
    for production in cfg:
        for d in derives[production[0]]:
            for ind in range(len(d)):
                if d[ind] != c:
                    continue
                ind += 1
                f = 1
                while(ind < len(d)):
                    f = 0
                    for x in first[d[ind]]:
                        if x != 'e':
                            follow[c].add(x)
                        else:
                            f = 1
                    if f == 0:
                        break   
                    ind += 1
                if ind >= len(d) and f == 1:
                    for x in getFollow(production[0]):
                        follow[c].add(x)
    return follow[c]

# ------------------------------ GET PARSE TABLE -------------------------------

table = defaultdict(lambda: '')
def fillTable(c):
    for each in derives[c]:
            ind = 0
            while(ind < len(each)):
                f = 0
                for x in first[each[ind]]:
                    if x == 'e':
                        f = 1
                    else:
                        table[c + x] = each
                if f == 0:
                    break
                ind += 1
            if ind == len(each) and f == 1:
                for x in follow[c]:
                    table[c + x] = each

# ----------------------------- PARSE -------------------------------------

def parse_string(s):
    i = 0
    f = 0
    stack = ['$', start]
    drawCircle(start, STARTX, STARTY)
    productiony = 0
    while(i < len(s) and len(stack) > 0):
        ch = stack.pop()
        if len(posStack) > 0:
            p = posStack.pop()
        if isTerminal(ch):
            if ch == s[i]:
                if ch != '$':
                    colorCircle(ch, p[0], p[1], BLUE)
                i = i + 1
            elif ch != 'e':
                if ch != '$':
                    colorCircle(ch, p[0], p[1], RED)
                print('String is not accepted')
                f = 1
                break
            else:
                colorCircle(ch, p[0], p[1], True)
        else:
            t = table[ch + s[i]][::-1]
            displayMsg(ch + "->" + t, 1000, 50 + productiony)
            productiony += 30
            colorCircle(ch, p[0], p[1], RED)
            drawDerive(t, p[0], p[1], p[2])
            colorCircle(ch, p[0], p[1], WHITE)
            if len(t) == 0:
                print('String is not accepted')
                f = 1
                break
            stack.extend(t)
            print(ch, s[i], stack)

    if f == 0:
        print('String is accepted')

    msg = 'String is accepted'
    if f == 1:
        msg = 'String is not accepted'
    
    displayMsg(msg, 500, 500)


def parse():
    global vis, cfg, start
    #cfg = [item for item in input("Enter the list items : ").split()]
    cfg = [item for item in "E->E+T|T T->TF|F F->F*|a|b".split()]
    s = "a*b+a$"
    start = 'E'

    cfg = removeLeftRecursion(cfg)
    # print(cfg)

    for production in cfg:
        derives[production[0]] = production[3:].split('|')
    for production in cfg:
        for x in production:
            if isTerminal(x):
                vis[x] = True
                first[x].add(x)
                terminals.append(x)
        getFirst(production[0])
    # for production in cfg:
    #     print(production[0], first[production[0]])

    vis = defaultdict(lambda: False)
    follow[start].add('$')
    for production in cfg:
        getFollow(production[0])
        # print(production[0], follow[production[0]])

    for production in cfg:
        fillTable(production[0])
    # print(table)

    #s = input("Enter the string")
    displayMsg(s, 10, 30)
    parse_string(s)

if __name__ == '__main__':
    setup()

    running = True
    firstTime = True
    while running:
        if firstTime:
            parse()
            firstTime = False
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
    