let budgetController = (function () {
  // Constructors
  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  let Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Methods for individual percentage calculation
  Expense.prototype.calcPerc = function (totalInc) {
    if (totalInc > 0) this.percentage = Math.round((this.value / totalInc) * 100);
    else this.percentage = -1;
  };
  Expense.prototype.getPerc = function () {
    return this.percentage;
  };

  // Income or expense total calculation
  let calculateTotal = function (type) {
    let sum = 0;

    data.allItems[type].forEach(function (element) {
      sum += element.value;
    });

    data.totals[type] = sum;
  };

  // Data structure
  let data = {
    allItems: {
      inc: [],
      exp: [],
    },

    totals: {
      inc: 0,
      exp: 0,
    },

    budget: 0,

    percentage: -1,
  };

  return {
    addNewItem: function (type, des, val) {
      let newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else ID = 0;

      // Create new item based on type
      if (type === 'inc') newItem = new Income(ID, des, val);
      else if (type === 'exp') newItem = new Expense(ID, des, val);

      // Add new item to data structure
      data.allItems[type].push(newItem);

      // Return new item
      return newItem;
    },

    deleteItem: function (type, id) {
      let IDs, index;

      // Create array with all elements ids
      IDs = data.allItems[type].map(function (element) {
        return element.id;
      });

      // Find the id
      index = IDs.indexOf(id);

      if (index !== -1) {
        // Delete the selected item
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      calculateTotal('inc');
      calculateTotal('exp');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0)
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      else data.percentage = -1;
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (item) {
        item.calcPerc(data.totals.inc);
      });
    },

    getPercentages: function () {
      let allPercentages = data.allItems.exp.map(function (item) {
        return item.getPerc();
      });

      return allPercentages;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage,
      };
    },

    // Data structure visualizaition
    test: function () {
      console.log(data);
    },
  };
})();

let UIController = (function () {
  let DOMStrings = {
    // Class names
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  let formatNumber = function (num, type) {
    num = Math.abs(num);
    num = num.toFixed(2);

    return (type === 'exp' ? '-' : '+') + ' ' + num;
  };

  return {
    // Get object with the input values
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    // Add item to the list
    addListItem: function (obj, type) {
      let placeholder, html, container;

      // Create placeholder html and list container
      if (type === 'inc') {
        container = DOMStrings.incomeContainer;

        placeholder =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        container = DOMStrings.expenseContainer;

        placeholder =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button><div></div></div>';
      }

      // Replace values
      html = placeholder.replace('%id%', obj.id);
      html = html.replace('%description%', obj.description);
      html = html.replace('%value%', formatNumber(obj.value, type));

      // Add to UI
      document.querySelector(container).insertAdjacentHTML('beforeend', html);
    },

    // Remomve item from the list
    deleteListItem: function (elementID) {
      let element = document.getElementById(elementID);

      element.parentNode.removeChild(element);
    },

    // Clear fields
    clearFields: function () {
      /*
        NOTE:
        It seems that forEach loops can be used on lists
        I'll leave the array transformation for learning pourpose
      */
      let fieldsList, fieldsArray;

      // Select the input fields
      fieldsList = document.querySelectorAll(
        DOMStrings.inputDescription + ', ' + DOMStrings.inputValue
      );

      // Transform list to array
      fieldsArray = Array.prototype.slice.call(fieldsList);

      // Clear each field
      fieldsArray.forEach((element) => {
        element.value = '';
      });

      // Re-focus description field
      fieldsArray[0].focus();
    },

    // Display budget
    displayBudget: function (obj) {
      let budgetType = obj.budget > 0 ? 'inc' : 'exp'; // defines the sign

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        budgetType
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalIncome,
        'inc'
      );
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(
        obj.totalExpenses,
        'exp'
      );

      if (obj.percentage > 0)
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      else document.querySelector(DOMStrings.percentageLabel).textContent = '---';
    },

    // Display expenses percentages
    displayPercentages: function (percentages) {
      let percentageLabels = document.querySelectorAll(DOMStrings.expPercentageLabel);

      percentageLabels.forEach(function (item, index) {
        if (percentages[index] > 0) item.textContent = percentages[index] + '%';
        else item.textContent = '---';
      });
    },

    // Display month and year
    displayDate: function () {
      let date = new Date();
      let months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[date.getMonth()] + ', ' + date.getFullYear();
    },

    // Update UI colors based on type change
    changedType: function () {
      let labels = document.querySelectorAll(
        DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
      );

      labels.forEach(function (label) {
        label.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    // Get the DOM class names
    getDOMStrings: function () {
      return DOMStrings;
    },
  };
})();

let controller = (function (budgetCtrl, UICtrl) {
  let setUpEventListeners = function () {
    let DOM = UICtrl.getDOMStrings();

    // Add item when button pressed
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // Add item when ENTER key pressed
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) ctrlAddItem();
    });

    // Delete item (event delegation)
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    // Change input outline color
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  let updateBudget = function () {
    // 1. Calculate budget
    budgetCtrl.calculateBudget();

    // 2. Get budget
    let budget = budgetCtrl.getBudget();

    // 3. Display budget
    UICtrl.displayBudget(budget);
  };

  let updatePercentages = function () {
    // 1. Calculate the percentage
    budgetCtrl.calculatePercentages();

    // 2. Read the percentage from the budget controller
    let percentages = budgetCtrl.getPercentages();

    // 3. Update UI
    UICtrl.displayPercentages(percentages);
  };

  let ctrlAddItem = function () {
    let input, item;

    // 1. Read input data
    input = UICtrl.getInput();

    // Input validation
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to the budget controller
      item = budgetCtrl.addNewItem(input.type, input.description, input.value);

      // 3. Add item to UI
      UICtrl.addListItem(item, input.type);

      // 4. Clear fields
      UICtrl.clearFields();

      // 5. Calculate  and display the budget
      updateBudget();

      // 6. Calculate and display percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = function (event) {
    let itemID, splitID, type, ID;

    // List item id
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // = type-id

    // If the string isn't empty it means that we successfully targeted the list item
    if (itemID) {
      // Split item id in type and id
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete from UI
      UICtrl.deleteListItem(itemID);

      // 3. Update budget
      updateBudget();

      // 4. Calculate and display percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      UICtrl.displayDate();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1,
      });
      setUpEventListeners();
      console.log('INITILIALIZED');
    },
  };
})(budgetController, UIController);

controller.init();
