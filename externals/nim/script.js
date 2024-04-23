/**
 * TODOS
 * -----------------------------------------------------------------------------
 * remove rule button
 * take 0 and split functionality
 * fix take n but split 0 nit set !
*/ 

function NIM() {
  // ----------------------------- CLASS VARIABLES -----------------------------
  this.active = false
  this.MIN_NUMBER = 1
  this.MAX_NUMBER = 32
  this.MAX_NUMBER_OF_RULES = 5
  this.MAX_PILE_HEIGHT = 25
  this.NIMBER_COLUMNS = 5
  this.MIN_DISPLAYED_NIMBERS = 0
  this.MAX_DISPLAYED_NIMBERS = 25
  
  this.NIMBERS = new Map()
  this.INF = 100
  this.gamestate_nimber = 0
  this.gamestate = []
  this.number_of_rules = 1
  this.total_rules = 1
  this.rules_displayed = 1
  this.rules = []
  this.input_piles = ''
  this.rule_regex = /^([0-9][0-9]?|INF),([0-9][0-9]?|INF);((\[(([0-9],)*[0-9]+)\])|((([0-9],)*[0-9]+)))$/
  this.pile_regex = /^([0-9]+,\s*)*[0-9]+\s*$/

  this.NIMBERS.set(0, {nimber: 0})

  // ---------------------------------------------------------------------------
  /**
   * This function initializes a the NIM-GAME
  */
  // ---------------------------------------------------------------------------
  this.initialize = () => {
    content_div = document.getElementById("content")
    info_div    = document.getElementById("info")
    algo_div    = document.getElementById("algo")
    
    document.getElementById('rule1').addEventListener("keyup", e => this.addRuleEventKeyUp(e))
    document.getElementById('piles').addEventListener("keyup", e => this.loadPilesEventKeyUp(e))
    document.getElementById('delete-btn-1').addEventListener("click", e => this.deleteRule(e))
  }

  this.computeNimbers = () => {
    for (let n = this.MIN_NUMBER; n <= this.MAX_NUMBER; n++) {
      this.NIMBERS.set(n, { rules: {} })
  
      this.rules.forEach(rule => {
        for (let i = rule.from; i <= rule.to; i++) {
          for (const split of rule.split) {
            this.computeNimber(n, split, i)
          }
        }

        let res = this.checkArray(n)
        this.NIMBERS.get(n)['nimber'] = res
      })
    }

    return this.NIMBERS
  }
  
  // ---------------------------------------------------------------------------
  /**
   * 
   * @param {*} n integer which a nimber should be computed
   * @param {*} split array of integers of possibilities to split a pile
   * @returns 
  */
  // ---------------------------------------------------------------------------
  this.computeNimber = (n, split, take) => {
    if ((n-take) < split) {
      return
    }

    if (split == 0) {
      if (n != take )
        return

      if (!(this.NIMBERS.get(n)['rules'][0]))
        this.NIMBERS.get(n)['rules'][0] = []

      if (!(this.NIMBERS.get(n)['rules'][0].some(t => t.take == n && t.split == 0)))
        this.NIMBERS.get(n)['rules'][0].push({take: n, split: 0})
      
      return
    } 
   
    else if (split == 1 && n-take > 0) {
      if (!(this.NIMBERS.get(n)['rules'][this.NIMBERS.get(n-take).nimber]))
        this.NIMBERS.get(n)['rules'][this.NIMBERS.get(n-take).nimber] = []
      this.NIMBERS.get(n)['rules'][this.NIMBERS.get(n-take).nimber].push({take: take, split: n-take})
      return
    }
    
    const combinations = this.splitNumber(n-take, split)
    
    if (combinations.length == 0){
      return
    }
    
    combinations.forEach(combination => {
      const nimber = this.computeNimberForCombination(combination) 

      if (!(this.NIMBERS.get(n)['rules'][nimber]))
        this.NIMBERS.get(n)['rules'][nimber] = []
      this.NIMBERS.get(n)['rules'][nimber].push({take: take, split: combination})
    })
  }
  
  // ---------------------------------------------------------------------------
  /**
   * Takes an array of integers as input and computes a nimber for this combination 
   * regarding the xor rule
   * 
   * @param {Array[Int]} combination 
   * @returns 
  */
  // ---------------------------------------------------------------------------
  this.computeNimberForCombination = (combination) => {
    let nimber = 0
    combination.forEach(combi => {
      nimber = nimber ^ this.NIMBERS.get(combi)['nimber']
    })
    return nimber
  }

  // ---------------------------------------------------------------------------
  /**
   * 
   * @param {*} set_of_integer set of integers
   * @returns missing integer otherwise last integer + 1
   */
  // ---------------------------------------------------------------------------
  this.checkArray = (n) => {
    const rules = this.NIMBERS.get(n).rules
    
    const nimber_for_n = Object.keys(rules).map(key => Number(key))
    let arr = Array.from(nimber_for_n).sort((a,b) => a-b)
    if (arr.length == 0) {
      return 0
    }
  
    if (arr[0] != 0) {
      return 0
    }
  
    for (let i = 0; i < arr.length; i++) {
      if (i - arr[i] != 0)
        return arr[i-1] +1
    }
    
    return arr[arr.length - 1] + 1
  }

  // ---------------------------------------------------------------------------
  /**
   * Takes parameter @n and @k as input and computes all possible combinations
   * to split @n
   * 
   * @param {Int} n Integer to split into parts
   * @param {Int} k number of parts to split @n
   * @param {*} minVal Do not change this value
   * @returns an array of integers
   */
  // ---------------------------------------------------------------------------
  this.splitNumber = (n, k, minVal = 1) => {
    if (k == 1)
      return [[n]]
     
    let solutions = []
    for (let i = minVal; i <= n/k; i++) {
      let subSolutions = this.splitNumber(n-i, k-1, i)
  
      for (let j = 0; j < subSolutions.length; j++) {
        solutions.push([i].concat(subSolutions[j]))
      }
    }
  
    return solutions;
  }
  
  // ---------------------------------------------------------------------------
  this.checkInput = (e, regex) => {
    let input = e.target.value
    e.target.style.border = "0"
    if (regex.test(input)) {
      e.target.style.boxShadow = "0 0 3px 2px green"
      // e.target.style.outlineColor = "green"
      e.target.style.outline = "2px solid green"
      
      return true
    }
    else {
      e.target.style.boxShadow = "0 0 3px 2px red"
      // e.target.style.outlineColor = "red"
      e.target.style.outline = "2px solid red"

    }
  }
  
  // ---------------------------------------------------------------------------
  /**
   * 
   */
  this.addRule = () => {
    let rules = document.getElementById("rules")

    let rule = (number) => {
      let container = document.createElement("div")
      let label = document.createElement("label")
      let input = document.createElement("input")
      let deleteBtn = document.createElement("button")
      
      this.total_rules += 1
      this.rules_displayed += 1
      container.className = "rule_container"
      container.setAttribute('data-tip', "- Input should be in form: from,to;split1,split2,... \n- use numbers from 1 to n \n- INF can be used for infinity")
      container.setAttribute('key', this.total_rules)
      input.className = "rule"
      input.type = "text"
      input.name = "rule" + number
      input.id = "rule" + number
      input.placeholder = "from,to;[split]"
      input.addEventListener("keyup", e => this.addRuleEventKeyUp(e))
      
      label.className = "rule_label"
      label.htmlFor = "rule" + number
      label.innerHTML = "Rule " + number + ":"

      deleteBtn.className = "delete-btn"
      deleteBtn.innerHTML = '<img src="externals/nim/delete.png" style="width: 0.75rem; height: 0.75rem;">'
      deleteBtn.addEventListener('click', e => this.deleteRule(e))
  
      container.appendChild(label)
      container.appendChild(input)
      container.appendChild(deleteBtn)

  
      return container
    }

    // MAXIMAL 5 RULES ARE ALLOWED - OTHERWISE GRAYED OUT
    if (this.rules_displayed < this.MAX_NUMBER_OF_RULES)
    {
      this.number_of_rules++
      rules.appendChild(rule(this.number_of_rules))
      if (this.rules_displayed == this.MAX_NUMBER_OF_RULES)
      {
        document.getElementById('addRule').style.backgroundColor = '#eee'
        document.getElementById('addRule').style.color = 'gray'
      }
    }
   
  }

  this.deleteRule = (event) => {
    rule_container = event.target
    i = 0
    while(rule_container.className != 'rule_container') {
      rule_container = rule_container.parentNode
      console.log(rule_container.className)
      if (i == 10) {
        console.log('break');
        return
      }
    }
    // key = Number.parseInt(rule_container.getAttribute('key'))
    key = rule_container.getAttribute('key')
    for (i = 0; i < this.rules.length; i++) {
      if (this.rules[i].key == key) {
        console.log(rules);
        this.rules.splice(i, 1)
        console.log(rules);
      }
    }
    rule_container.remove()
    this.rules_displayed -= 1
    this.loadRules()
  }
  
  // ---------------------------------------------------------------------------
  this.addRuleEventKeyUp = (event) => {
    if (event.key === "Enter") {
      this.loadRules()
    } else
    if (this.checkInput(event, this.rule_regex))
      this.loadRules()
  }
  
  // ---------------------------------------------------------------------------
  this.loadPilesEventKeyUp = (event) => {
    if (event.key === "Enter") {
      this.loadGame()
    } else
      if (this.checkInput(event, this.pile_regex))
        this.loadGame()
  }

  // ---------------------------------------------------------------------------
  this.setupGameField = (gamefield) => {
    const gameboard = document.getElementById('gameboard')
    gameboard.textContent = ''
    this.createPiles(gameboard, gamefield)
  }

  // ---------------------------------------------------------------------------
  this.createPiles = (parent, piles_array) => {
    for (let i = 0; i < piles_array.length; i++) {
      let pile_wrapper = document.createElement("div")
      pile_wrapper.className = 'pile_wrapper'
      
      let pile = document.createElement("div")
      pile.className = 'pile'
      pile_wrapper.appendChild(pile)

      let pile_height = document.createElement("div")
      pile_height.className = 'pile_height'
      pile_height.innerText = piles_array[i]
      pile_height.addEventListener('click', e => this.removeZeroStones(e))
      pile_wrapper.appendChild(pile_height)      
      
      for (let j = 0; j < piles_array[i]; j++) {
        if (j > 24)
          break
        let stone = document.createElement("div")
        stone.className = 'stone'
        stone.setAttribute('stone', j+1)
        stone.addEventListener('click', e => this.removeStones(e))
        pile.appendChild(stone)
      }
      parent.appendChild(pile_wrapper)
    }
  }

  // ---------------------------------------------------------------------------
  this.updatePile = (pile, new_number_of_stones) => {
    if (new_number_of_stones == 0)
      pile.parentNode.remove()
    else {
      pile.innerHTML = ''
      pile_height = pile.parentNode.getElementsByClassName('pile_height')[0]
      pile_height.innerText = new_number_of_stones
  
      for (let j = 0; j < new_number_of_stones; j++) {
        let stone = document.createElement("div")
        stone.className = 'stone'
        stone.setAttribute('stone', j+1)
        stone.addEventListener('click', e => this.removeStones(e))
        pile.appendChild(stone)
      }
    }
    this.computeGamestate()
  }

  // ---------------------------------------------------------------------------
  this.loadGame = () => {
    try {
      this.input_piles = document.getElementById('piles').value
      this.input_piles = this.input_piles.replace(', ', ',')
      // this.input_piles = this.input_piles.replace(/([0-9]+)\s+([0-9]+)/, '(1),(2)')
      let input_nr = this.input_piles.split(',').map(element => {
        pile = Number(element)
        if (pile > this.MAX_PILE_HEIGHT) {
          pile = this.MAX_PILE_HEIGHT
          this.createPopoverMaxPileHightExeed()
        }
        return pile
      })
      this.setupGameField(input_nr)
      this.computeGamestate()
    }
    catch {
      console.log('ERROR')
    }

  }

  // ---------------------------------------------------------------------------
  this.loadRules = () => {
    const rules_div = document.getElementById('rules')
    const childnodes = rules_div.childNodes
    const rule_containers = Array.prototype.slice.call(childnodes).filter(child => child.className == 'rule_container')

    // PROCESS RULES READS ALL INPUTS AND RETURNS USABLE RULES 
    this.rules = rule_containers.map( rule => {
                                                const key = rule.getAttribute('key');
                                                const value = rule.querySelector('.rule').value;
                                                return { key, value };
                                              })
                                              .filter(rule => this.rule_regex.test(rule.value))
                                              .map( rule => ({ ...rule, value: rule.value.split(';') }))
                                              .map( rule => {
                                                              const range = rule.value[0].split(',').map(n => {
                                                                if (n === 'INF') {
                                                                  n = this.INF;
                                                                }
                                                                return Number(n);
                                                              });
                                                              const splits = rule.value[1].split(',').map(n => Number(n));
                                                              console.log(rule);
                                                              return { key: rule.key, from: range[0], to: range[1], split: splits };
                                                            })
  
  

    this.computeNimbers()
    this.showNimbers()
    this.computeGamestate()
  }
  
  // ---------------------------------------------------------------------------
  this.removeStones = (e) => {
    const pile = e.target.parentNode
    const stones_to_remove = e.target.getAttribute('stone')
    const new_number_of_stones = pile.childNodes.length - stones_to_remove

    this.checkRules(pile, stones_to_remove, new_number_of_stones)
    this.computeGamestate()
  }

  // ---------------------------------------------------------------------------
  this.removeZeroStones = (e) => {
    const pile = e.target.previousElementSibling
    const stones_to_remove = 0
    const new_number_of_stones = pile.childNodes.length - stones_to_remove

    this.checkRules(pile, stones_to_remove, new_number_of_stones)
    this.computeGamestate()
  }

  // ---------------------------------------------------------------------------
  this.checkRules = (pile, stones_to_remove, new_number_of_stones) => {
    let possible_splits = []

    n = parseInt(stones_to_remove) + new_number_of_stones
    Object.values(nim.NIMBERS.get(n).rules).forEach(nimber => {
      nimber
      nimber.forEach(rule => {
        a = rule.take
        b = stones_to_remove
        if (rule.take == stones_to_remove) {
          if (Number.isInteger(rule.split))
            possible_splits.push(1)
          else
            possible_splits.push(rule.split.length)
        }
        
      })
    })
    possible_splits = [...new Set(possible_splits)]
    possible_splits.sort()
    // console.log('possible splits: ', possible_splits);
    if (possible_splits.length == 0)
    {
      this.createPopoverNotAllowed()
      return
    }

    if (possible_splits.length == 1) {
      if (possible_splits[0] == 1 || possible_splits[0] == 0) {
        this.updatePile(pile, new_number_of_stones)
      }
      else {
        this.createPopoverSplit(pile, possible_splits[0], new_number_of_stones)
      }
      return
    }

    this.createPopoverMultipleSplit(pile, new_number_of_stones, possible_splits)
  }


  // ---------------------------------------------------------------------------
  this.showNimbers = () => {
    const nimbers_container = document.getElementById('nimbers')
    nimbers_container.innerHTML = ''
    let container = document.createElement('div')
    
    delta = this.MAX_DISPLAYED_NIMBERS - this.MIN_DISPLAYED_NIMBERS + 1
    items_per_column = Math.round(delta / this.NIMBER_COLUMNS)
    col_counter = 0
    console.log(this.NIMBER_COLUMNS, items_per_column);
    for (let i = this.MIN_DISPLAYED_NIMBERS; i <= this.MAX_DISPLAYED_NIMBERS; i++) {
      console.log(col_counter);
      if (col_counter % items_per_column == 0) {
        container = document.createElement('div')
        container.className = 'rule_col'
        nimbers_container.appendChild(container)
      }
      let nimber = document.createElement('div')
      nimber.innerText = `${i} → *${this.NIMBERS.get(i)['nimber']}`
      if (col_counter < this.NIMBER_COLUMNS * items_per_column)
        container.appendChild(nimber)
      col_counter++
    }
  }

  this.logNimbers = () => {
    for (let i = 0; i <= this.MAX_NUMBER; i++) {
      console.log(`${i} → *${this.NIMBERS.get(i)['nimber']}`)
    }
  }

  // ---------------------------------------------------------------------------
  this.computeGamestate = () => {
    console.log(this.input_piles);
    if (this.input_piles.length < 1) {
      console.log('NO GAMESTATE COMPUTED');
      return
    }

    const gameboard = document.getElementById('gameboard')
    const gamestate = document.getElementById('gamestate_container')
    gamestate_container.innerHTML = ''

    const piles = Array.prototype.slice.call(gameboard.childNodes).map(pile_wrapper => Number(pile_wrapper.getElementsByClassName('pile_height')[0].innerText))
    console.log("Piles: ", piles)
    const tabel = document.createElement('table')
    gamestate.appendChild(tabel)

    const head_row = document.createElement('tr')
    const th_pile = document.createElement('th')
    const th_nimber = document.createElement('th')
    const th_nimber_bin = document.createElement('th')
    th_nimber_bin.style.letterSpacing = 0
    
    th_pile.className ='table_cell_pile_name'
    th_nimber.className ='table_cell_nimber'
    th_nimber_bin.className ='table_cell_nimber_binary'
    
    th_pile.innerText = 'height of pile'
    th_nimber.innerText ='Nimber'
    th_nimber_bin.innerText = 'Binary'
    
    head_row.appendChild(th_pile)
    head_row.appendChild(th_nimber)
    head_row.appendChild(th_nimber_bin)
    tabel.appendChild(head_row)

    this.gamestate = []


    if (piles.length < 1)
      return
      
    for (let i = 0; i < piles.length; i++) {
      this.gamestate.push(piles[i])
      const tr = document.createElement('tr')
      const td_pile = document.createElement('td')
      const td_nimber = document.createElement('td')
      const td_nimber_bin = document.createElement('td')

      td_pile.innerText = piles[i]
      td_nimber.innerText = `*${this.NIMBERS.get(piles[i]).nimber}`
      td_nimber_bin.innerText = (`${this.convertNumToBinary(this.NIMBERS.get(piles[i]).nimber)}`).padStart(5, '0')

      td_pile.className ='table_cell_pile_name'
      td_nimber.className ='table_cell_nimber'
      td_nimber_bin.className ='table_cell_nimber_binary'

      tr.appendChild(td_pile)
      tr.appendChild(td_nimber)
      tr.appendChild(td_nimber_bin)
      tabel.appendChild(tr)
    }
    
    this.gamestate_nimber = this.computeNimberForCombination(piles)
    const tr = document.createElement('tr')
    tr.className = 'total_row'
    const td_pile = document.createElement('td')
    const td_nimber = document.createElement('td')
    const td_nimber_bin = document.createElement('td')

    td_pile.className ='table_cell_pile_name'
    td_nimber.className ='table_cell_nimber'
    td_nimber_bin.className ='table_cell_nimber_binary'

    td_pile.innerText = 'Total'
    td_nimber.innerText = `*${this.gamestate_nimber}`
    td_nimber_bin.innerText = (`${this.convertNumToBinary(this.gamestate_nimber)}`).padStart(5, '0')

    tr.appendChild(td_pile)
    tr.appendChild(td_nimber)
    tr.appendChild(td_nimber_bin)
    tabel.appendChild(tr)

    const winningmoves = this.computeWinningMoves()
    this.showWinningMoves(winningmoves)
  }

  // ---------------------------------------------------------------------------
  this.showPopover = (heading, content, warning=0, buttons) => {
    const popover = document.getElementById('popover')
    const popover_heading = document.getElementById('popover_heading')
    const popover_content = document.getElementById('popover_content')
    const popover_warning = document.getElementById('popover_warning')
    const popover_buttons = document.getElementById('popover_buttons')
    
    popover.classList.remove('popover_hidden')

    popover_heading.innerHTML = ''    
    popover_content.innerHTML = ''    
    popover_warning.innerHTML = ''    
    popover_buttons.innerHTML = ''    

    
    
    popover_heading.appendChild(heading)
    popover_content.appendChild(content)
    
    if (Array.isArray(buttons))
      buttons.map(btn => popover_buttons.appendChild(btn))
    else
      popover_buttons.appendChild(buttons)

    
    if (warning != 0)
      popover_warning.appendChild(warning)
  }

  // ---------------------------------------------------------------------------
  this.createPopoverMaxPileHightExeed = () => {
    piles_input = document.getElementById('piles')
    input = piles.value
    input = input.replace(/\d+(\.\d+)?/g, match => match > this.MAX_PILE_HEIGHT ? this.MAX_PILE_HEIGHT : match)
    piles.value = input

    const info = document.createElement('div')
    info.innerText = `Maximal pile height is ${this.MAX_PILE_HEIGHT}`

    const heading = document.createElement('h1')
    heading.innerText = 'Info'
    
    return_btn = document.createElement('button')
    return_btn.addEventListener('click', e => popover.classList.add('popover_hidden'))
    return_btn.innerText = 'OK'
    return_btn.className = 'btn'
    
    this.showPopover(heading, info, 0, return_btn)
  }
 
  this.createPopoverNotAllowed = () => {  
    const info = document.createElement('div')
    info.innerText = "Move is not allowed"

    const heading = document.createElement('h1')
    heading.innerText = 'Info'
    
    return_btn = document.createElement('button')
    return_btn.addEventListener('click', e => popover.classList.add('popover_hidden'))
    return_btn.innerText = 'OK'
    return_btn.className = 'btn'
    
    this.showPopover(heading, info, 0, return_btn)
  }
  
  // ---------------------------------------------------------------------------
  this.createPopoverSplit = (pile, number_of_piles, remaining_stones) => {
    const content = document.createElement('div')
    const content_info = document.createElement('div')
    content_info.className = 'content_info'

    const heading = document.createElement('h1')
    heading.innerText = 'Info'

    content_info.innerText = `How do you want to distribute ${remaining_stones} stones to ${number_of_piles} piles?`
    content.appendChild(content_info)

    const piles = document.createElement('div')
    piles.className = 'popover_warning_piles'
    piles.id = 'popover_warning_piles'

    for (let i = 0; i < number_of_piles; i++) {
      const pile_div = document.createElement('div')
      pile_div.className = 'pile_form'
      const input = document.createElement('input')
      const label = document.createElement('label')

      input.className = "popover_input"
      input.type = "text"
      input.name = "pile" + i
      input.id = "pile" + i
      input.addEventListener('keyup', e => this.updateInfo("Stones left: "))

      label.className = "pile_label"
      label.htmlFor = "pile" + i
      label.innerHTML = "Pile " + (i+1) + ":"
      
      pile_div.appendChild(label)
      pile_div.appendChild(input)
      piles.appendChild(pile_div)
    }
    content.appendChild(piles)

    // ADD STONES LEFT INFORMATION
    const warining = this.printInfo(remaining_stones)

    const return_btn = document.createElement('button')
    return_btn.addEventListener('click', e => this.splitPiles(pile, remaining_stones))
    return_btn.innerText = 'OK'
    return_btn.className = 'btn'

    const cancleBtn = this.cancleBtn()

    this.showPopover(heading, content, warining, [cancleBtn, return_btn])
  }
  
  // ---------------------------------------------------------------------------
  this.createPopoverMultipleSplit = (pile, remaining_stones, splits) => {
    const content = document.createElement('div')
    const content_info = document.createElement('div')

    content.className = 'center_box'

    const heading = document.createElement('h1')
    heading.innerText = 'Info'

    content_info.innerText = "In how many piles do you want to split?"
    content.appendChild(content_info)

    const piles = document.createElement('div')
    piles.className = 'popover_warning_piles'
    piles.id = 'popover_warning_piles'

    for (let i = 0; i < splits.length; i++) {
      if (splits[i] == 0)
        continue

      btn = document.createElement('button')
      btn.addEventListener('click', e => this.splitSelected(pile, e.target.innerText, remaining_stones))
      btn.innerText = splits[i]
      btn.className = 'btn'
      piles.appendChild(btn)
    }
    content.appendChild(piles)

    const center_box = document.createElement('div')
    center_box.className = 'center_box'
    const cancleBtn = this.cancleBtn()

    this.showPopover(heading, content, 0, cancleBtn)
  }

  // ---------------------------------------------------------------------------
  this.splitSelected = (pile, chocen_split, remaining_stones) => {
    if (chocen_split == 0) {
      this.updatePile(pile, remaining_stones)
    }
    if (chocen_split == 1) {
      this.updatePile(pile, remaining_stones)

      const popover = document.getElementById('popover')
      popover.classList.add('popover_hidden')
      return
    }
    this.createPopoverSplit(pile, chocen_split, remaining_stones)
  }

  // ---------------------------------------------------------------------------
  this.splitPiles = (pile, remaining_stones) => {
    const popover = document.getElementById('popover')
    
    const popover_warning_piles = document.getElementById('popover_warning_piles')

    const piles = Array.prototype.slice.call(popover_warning_piles.childNodes)
                                 .map(pile => pile.querySelector('.popover_input').value)
                                 .map(n => Number(n))

    const sum = piles.reduce((a,b) => a+b)

    if (sum != remaining_stones) {
      this.printWarning(`Piles should sum up to ${remaining_stones}`)
    }
    else if (piles.find(n => n == 0) == 0) {
      this.printWarning('No empty pile allowed')
    }
    else if (piles.find(n => n < 0)) {
      this.printWarning('No negative pile allowed')
    }
    else {
      pile.parentNode.remove()
      const gameboard = document.getElementById('gameboard')
      this.createPiles(gameboard, piles)
      this.computeGamestate()
      popover.classList.add('popover_hidden')
    }
  }
  
  // ---------------------------------------------------------------------------
  this.printWarning = (message) => {
    const old_box = document.getElementById('warning_box')
    if (old_box)
      old_box.remove()
    const warning_box = document.createElement('div')
    warning_box.innerText = 'Warning: ' + message
    warning_box.className = 'warning_box'
    warning_box.id = 'warning_box'
    popover_warning_piles.parentNode.appendChild(warning_box)
  }
  
  // ---------------------------------------------------------------------------
  this.printInfo = (message) => {
    const popover_warning = document.getElementById('popover_warning')
    popover_warning.innerHTML = ''

    const info_box = document.createElement('div')
    info_box.innerText = 'Stones left: ' + message
    info_box.className = 'info_box'
    info_box.id = 'info_box'
    info_box.setAttribute('pileHeight', message)
    
    return info_box
  }
  
  // ---------------------------------------------------------------------------
  this.updateInfo = (message) => {
    const info_box = document.getElementById('info_box')
    const original_height = info_box.getAttribute('pileHeight')

    const piles_container = document.getElementById('popover_warning_piles').childNodes
    const piles = Array.prototype.slice.call(piles_container)
                  .filter(child => child.className == 'pile_form')
                  .map(div => {
                    return Array.prototype.slice.call(div.childNodes)
                              .filter(child => child.className == 'popover_input')
                              .map(input => input.value)
                  })
                  .map(n => Number(n))
                  
    const sum_piles = piles.reduce((a,b) => a+b)
    document.getElementById('info_box').innerText = message + (original_height - sum_piles)
  }
  
  // ---------------------------------------------------------------------------
  this.cancleBtn = () => {
    const cancleAction = () => {
      popover.classList.add('popover_hidden')
      this.computeGamestate()
    }
    const btn = document.createElement('button')
    btn.addEventListener('click', e => cancleAction())
    btn.innerText = 'cancle'
    btn.className = 'btn option_btn'
    return btn
  }
  
  // ---------------------------------------------------------------------------
  this.convertNumToBinary = (n) => {
    if (n === undefined)
      console.error('ERROR: n is undefined')
    const convert = (n, i) => {
      if (n == 0) 
        return 0
      const res = n & (1<<i) ? 1 : 0
      return (res * 10**i + convert(n-(2**i * res), i+1))
    }
    return convert(n, 0)
  }
  // ---------------------------------------------------------------------------
  this.computeWinningMoves = () => {
    const winningmoves = new Map()

    for (let i = 0; i < this.gamestate.length; i++) {
      const rest = this.gamestate.filter( (val, j) => i != j)
      const rest_nimber = this.computeNimberForCombination(rest)
      const pivot = this.gamestate[i]
      
      const nim = this.NIMBERS.get(pivot)
      const rules = nim.rules[rest_nimber]

      if (rules !== undefined) {
        Object.values(rules).map(rule => {
          const r = {'pivot': pivot,'rule': rule}
          const key = this.simpleHash(r)
          winningmoves.set(key, r)
        })
      }
    }
    return winningmoves
  }
  
  // ---------------------------------------------------------------------------
  this.showWinningMoves = (winningmoves) => {
    const nim_winningmoves = document.getElementById('nim_winningmoves')
    nim_winningmoves.innerHTML = ''

    if (winningmoves.size == 0)
      return

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')
    
    const tr = document.createElement('tr')
    const th_pile = document.createElement('th')
    const th_take = document.createElement('th')
    const th_split = document.createElement('th')

    th_pile.innerHTML = 'height of pile'
    th_take.innerHTML = 'take'
    th_split.innerHTML = '<div>split into</div><div> pile(s) with height</div>'

    tr.appendChild(th_pile)
    tr.appendChild(th_take)
    tr.appendChild(th_split)
    thead.appendChild(tr)
    table.appendChild(thead)
    table.appendChild(tbody)

    winningmoves.forEach( (move, i) => {
      const tr = document.createElement('tr')
      const td_pile = document.createElement('td')
      const td_take = document.createElement('td')
      const td_split = document.createElement('td')
      
      td_pile.innerText = move.pivot
      td_take.innerText = move.rule.take
      td_split.innerText = move.rule.split

      tr.appendChild(td_pile)
      tr.appendChild(td_take)
      tr.appendChild(td_split)
      tbody.appendChild(tr)
    })

    nim_winningmoves.appendChild(table)

  }

  // ---------------------------------------------------------------------------
  // SIMPLE HASHFUNCTION FROM STACKOVERFLOW: https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type
  this.simpleHash = (input) => {
    
    // ADD ADAPTION TO INTERNALY HANDLE OBJECTS
    var string = input
    if (typeof(input) === 'object')
      string = JSON.stringify(input)
    // END ADAPTION
      
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        var code = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  this.test = () => {
    test_1 = [{from: 1,to: 1,split: [0,1]},{from: 3,to: 3,split: [0,1]},{from: 5,to: 5,split: [2]},{from: 8,to: 8,split: [0,1,2]}]
    sol_1 = [0,1,0,1,0,1,0,1,2,3,2,3,2,3,2] 
  
    test_2 = [{from: 1,to: 1,split: [0,1]},{from: 3,to: 3,split: [0,1]},{from: 6,to: 6,split: [2]},{from: 8,to: 8,split: [0,1,2]}]
    sol_2 = [0,1,0,1,0,1,0,1,2,3,2,0,1,0,1]
  
    test_3 = [{from: 1,to: 1,split: [0,1]},{from: 3,to: 3,split: [0,1]},{from: 7,to: 7,split: [2]},{from: 10,to: 10,split: [0,1,2]}]
    sol_3 = [0,1,0,1,0,1,0,1,0,1,2,3,2,3,2]

    test_4 = [{from: 1,to: 100,split: [0,1]}]
    sol_4 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]

    test_5 = [{from: 1,to: 100,split: [1]}]
    sol_5 = [0,0,1,2,3,4,5,6,7,8,9,10,11,12,13]
  
    function makeTest(rules, solution) {
      const nim = new NIM()
      nim.rules = rules
      nim.computeNimbers()
      console.dir(nim.rules)
      console.log(' i -> value | solution ')
      passed = 1
      for (let i = 0; i < 15; i++)
      {
        let sign = '\033[32;1;1m'+'✓'+'\033[0m'
        if (nim.NIMBERS.get(i)['nimber'] != solution[i]) {
          sign = '\033[31;1;1m'+'x'+'\033[0m'
          passed = 0
        }

        index = `${i}`.padStart(2)
        nimber_v = `${nim.NIMBERS.get(i)['nimber']}`.padStart(5-2)
        nimber_s = `${solution[i]}`.padStart(8-3)
        space = ' '.repeat(4)
        console.log( `${index} ->  ${nimber_v}  | ${nimber_s} ${space} ${sign}`)
      }
      return passed 
    }
    tests = [test_1, test_2, test_3, test_4, test_5]
    solutions = [sol_1, sol_2, sol_3, sol_4, sol_5]

    passed_tests = 0
    for (let i = 0; i<tests.length; i++) {
      console.log('\nTEST '+(i+1))
      passed_tests += makeTest(tests[i], solutions[i])
    }
    console.log(`\nPassed ${passed_tests} out of ${tests.length}`)
  }
}

let nim = new NIM();

let rules = [{from: 2, to: 3, split: [1]}]
nim.rules = rules
console.dir(nim.computeNimbers())
// console.dir(JSON.stringify(nim.NIMBERS));
// nim.NIMBERS.forEach(n => console.dir(JSON.stringify(n)))
// nim.NIMBERS.forEach(n => console.dir(n['nimber']))

// nim.logNimbers()
