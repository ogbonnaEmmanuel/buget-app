
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage; 
    }

    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value/totalIncome) * 100);

        }else{
            this.percentage = -1;
        }


        }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum  += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItems: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length >0)
            {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }


            if(type === 'exp')
            {

            newItem = new Expense(ID, des, val);

            }else if(type === 'inc'){
                 
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
    
        deleteItem: function(type, id){
            var ids, index;
          ids =  data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            if(index !== -1)
            {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0)
            {

            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentage: function()
        {

            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentage(data.totals.inc);
            });
        },

        getPercentage: function(){
            var allPercent = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercent;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }

    };

})();


var UIController = (function(){
    var DomStrings = {
        inputType: '.add_type',
        input_description: '.add_description',
        inputValue: '.add_value',
        inputBtn: '.add_btn',
        incomeContainer: '.income-list',
        expenseContainer: '.expense-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.income-val',
        expenseLabel: '.expense-val',
        percentageLabel: '.exp-percent',
        container: '.container',
        expensesPercLabel: '.item_percent',
        dateLabel: '.budget_month',
    }

   var formatNumber = function(num, type){
        var numSplit, int, dec, result, sign;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3)
        {
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';
        
        result = sign + ' '+ int + '.' + dec;
        return result;
    }

    var nodeListForEach = function(list, callback){
        for(var i= 0; i<list.length; i++)
        {
            callback(list[i], i);
        }   
    };

    return {
        getInput: function(){
            return {
             type : document.querySelector(DomStrings.inputType).value,
            description: document.querySelector(DomStrings.input_description).value,
            value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }
        },

        addListItems: function(obj, type){
            var html, newHtml, element;
            if(type === 'inc')
            {
                element = DomStrings.incomeContainer;
                html =  '<div class="row divide-my-cell" id="inc-%id%"><div class="col-sm-6"><p class="item_desc">%description%</p></div><div class="col-sm-3"><p class="item_value">%value%</p></div><div class="col-sm-3"><button class="item_delete btn">-</button></div></div>';

            }else if(type === 'exp'){
                element = DomStrings.expenseContainer;
                html = '<div class="row divide-my-cell" id="exp-%id%"><div class="col-sm-6"><p class="item_desc">%description%</p></div><div class="col-sm-3"><p class="item_value">%value%</p></div><div class="col-sm-1"><button class="btn item_delete">-</button></div><div class="col-sm-2"><p class="item_percent">5%</p></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            var fields, fieldsArray;
          fields = document.querySelectorAll(DomStrings.input_description + ', ' + DomStrings.inputValue);

          fieldsArray = Array.prototype.slice.call(fields);

          fieldsArray.forEach(function(current, index, array){
              current.value  = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DomStrings.budgetLabel).textContent =  formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage;

            if(obj.percentage > 0)
            {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%'; 
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = '----';
            }
        },

        displayPercentages: function(percentages){

             var fields = document.querySelectorAll(DomStrings.expensesPercLabel);

             

             nodeListForEach(fields, function(current, index){
                 if(percentages[index] > 0)
                 {
                 current.textContent = percentages[index] + '%';
                 }else {
                     current.textContent = '---';
                 }
             });
        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            months = [
                'january', 'febuary',
                'march', 'April',
                'may', 'june',
                'july', 'august',
                'september', 'october',
                'november', 'december'
            ]

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DomStrings.dateLabel).textContent = months[parseInt(month)] + ', ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.input_description + ',' +
                DomStrings.inputValue
                );
 
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('color-exp');
            });
            
        },

        getDomStrings: function(){
            return DomStrings;
        }
    };
})();


var controller = (function(budgetCtrl, UiCtrl){

    var setUpEventListeners = function(){
        var Dom = UiCtrl.getDomStrings();
        document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){ 
                if(event.keyCode === 13 || event.which === 13)
                {
                        ctrlAddItem();
                }
    });

        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(Dom.inputType).addEventListener('change', UiCtrl.changedType);
    };

    var updateBudget = function(){
          budgetCtrl.calculateBudget();

          var budget = budgetCtrl.getBudget();
          
          UiCtrl.displayBudget(budget);
    };

    var updatePercentage = function(){
        budgetCtrl.calculatePercentage();
        var percent = budgetCtrl.getPercentage();
        UiCtrl.displayPercentages(percent);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        input = UiCtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
       newItem = budgetCtrl.addItems(input.type, input.description, input.value);
       UiCtrl.addListItems(newItem, input.type);
       UiCtrl.clearFields();

       updateBudget();
       updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

      itemID =  event.target.parentNode.parentNode.id;
      if(itemID)
      {
          splitID = itemID.split('-');
          type = splitID[0];
          ID = parseInt(splitID[1]);
          budgetCtrl.deleteItem(type, ID);
          UiCtrl.deleteListItem(itemID);

          updateBudget();
          updatePercentage();
      }
    };

    return {
        init: function(){
            console.log('Application has started');
            UiCtrl.displayMonth();
            UiCtrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }
            );
            setUpEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();