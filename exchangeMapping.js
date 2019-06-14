
var exchangeMapping = {
    "Bitstamp": {
        "_KnownCSVColumns":      function(pSource) { return "Type,Datetime,Account,Amount,Value,Rate,Fee,Sub Type".split(","); },
        "Date":             function(pSource) {
            var a = moment(pSource['Datetime'], "MMM. DD, YYYY, hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z"); },
        "Type":             function(pSource) {
            switch(pSource['Type']) {
                case "Deposit":
                    return "DEPOSIT";
                case "Market":
                    return pSource["Sub Type"].toUpperCase();
                case "Sub Account Transfer":
                    return "TRANSFER";
                case "Withdrawal":
                    return "WITHDRAW";
                case "Card Deposit":
                    return "DEPOSIT";
            }},
        "Exchange":         function(pSource) { return "Bitstamp"; },
        "Base amount":      function(pSource) { return pSource['Amount'].split(' ')[0] },
        "Base currency":    function(pSource) { return pSource['Amount'].split(' ')[1] },
        "Quote amount":     function(pSource) { return pSource['Value'].split(' ')[0]},
        "Quote currency":   function(pSource) { return pSource['Value'].split(' ')[1]},
        "Fee":              function(pSource) { return pSource['Fee'].split(' ')[0]},
        "Fee currency":     function(pSource) { return pSource['Fee'].split(' ')[1]},

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            switch(pSource['Type']) {
                case "Deposit":
                    return "Other_Wallet";
                case "Market":
                    return '';
                case "Sub Account Transfer":
                    return pSource["Account"];
                case "Withdrawal":
                    return "My_Wallet";
                case "Card Deposit":
                    return "Other_Wallet";
            }
        },
        "Sent to":                 function(pSource) {
            switch(pSource['Type']) {
                case "Deposit":
                    return "My_Wallet";
                case "Market":
                    return '';
                case "Sub Account Transfer":
                    return 'My_Wallet';
                case "Withdrawal":
                    return "Other_Wallet";
                case "Card Deposit":
                    return "My_Wallet";
            }
        },
        "Notes":                   function(pSource) { return ""; }
    },

    "Binance": {
        // NOTE: The base currency is always last on binance pairs,
        //       however Delta expects the pairs in this format
        "_KnownCSVColumns": function(pSource) { return "Date(UTC),Market,Type,Price,Amount,Total,Fee,Fee Coin".split(","); },
        "Date":     function(pSource) {
            var a = moment(pSource["Date(UTC)"], "YYYY-MM-DD hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) { return pSource["Type"].toUpperCase(); },
        "Exchange": function(pSource) { return "Binance"; },

        "Base amount":   function(pSource) { return pSource["Amount"]; },
        "Base currency": function(pSource) {
            // To decide on where to split the 'Market' field, we find the Fee
            // Knowing the base pair is always last, we always take the second part of the Market string
            for( var symbol in exchangeData["Binance"].symbols) {

                pos = pSource["Market"].indexOf(exchangeData["Binance"].symbols[symbol]);
                if(pos!=-1)
                    break;
            }

            if(pos) {
                Quote = pSource["Market"].substring(0, pos);
                Base = pSource["Market"].substring(pos);
            } else {
                Base = pSource["Market"].substring(pSource["Fee Coin"].length);
                Quote = pSource["Market"].substring(0, pSource["Fee Coin"].length);
            }

            if(Quote == "BCC")
                Quote = "BCHABC";

            return Quote;
        },

        "Quote amount":     function(pSource) { return pSource['Total']; },
        "Quote currency":   function(pSource) {
            for( var symbol in exchangeData["Binance"].symbols) {

                pos = pSource["Market"].indexOf(exchangeData["Binance"].symbols[symbol]);
                if(pos!=-1)
                    break;
            }

            if(pos) {
                Quote = pSource["Market"].substring(0, pos);
                Base = pSource["Market"].substring(pos);
            } else {
                Base = pSource["Market"].substring(pSource["Fee Coin"].length);
                Quote = pSource["Market"].substring(0, pSource["Fee Coin"].length);
            }

            if(Base == "BCC")
                Base = "BCHABC";

            return Base;
        },

        "Fee":              function(pSource) { return pSource['Fee']; },
        "Fee currency":     function(pSource) { return pSource['Fee Coin']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Binance_Deposit_Widhdraw": {
        "_KnownCSVColumns": function(pSource)  { return "Date,Coin,Amount,TransactionFee,Address,TXID,SourceAddress,PaymentID,Status".split(","); },

        "Date": function(pSource) {
            var a = moment(pSource['Date'], "YYYY-MM-DD hh:mm:ss aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },

        "Type":     function(pSource) {
            switch(guessFilename){
                case 'deposit':
                    return 'DEPOSIT';
                case 'withdraw':
                    return 'WITHDRAW';
                default:
                    return 'DEPOSIT';
            }
        },
        "Exchange": function(pSource) { return "Binance"; },
        "Base amount":   function(pSource) { return pSource["Amount"]; },
        "Base currency": function(pSource) { return pSource["Coin"]; },

        "Quote amount":     function(pSource) { return ''; },
        "Quote currency":   function(pSource) { return ''; },

        "Fee":              function(pSource) { return pSource['TransactionFee']; },
        "Fee currency":     function(pSource) { return pSource['Coin']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            switch(guessFilename){
                case 'deposit':
                    return 'Other_Wallet';
                case 'withdraw':
                    return 'My_Wallet';
                default:
                    return 'Other_Wallet';
            }
          },
        "Sent to":                 function(pSource) {
            switch(guessFilename){
                case 'deposit':
                    return 'My_Wallet';
                case 'withdraw':
                    return 'Other_Wallet';
                default:
                    return 'My_Wallet';
            }
        },
        "Notes":                   function(pSource) { return ""; }
    },

    "KuCoin": {
        "_KnownCSVColumns": function(pSource)  { return "Time,Coins,Sell/Buy,Filled Price,Coin,Amount,Coin,Volume,Coin,Fee,Coin".split(","); },
        "_RenameCSVColumns": function(pSource) { return "Time,Coins,Sell/Buy,Filled Price,Price-Coin,Amount,Amount-Coin,Volume,Volume-Coin,Fee,Fee-Coin"},

        "Date":     function(pSource) { return pSource["Time"]; },
        "Type":     function(pSource) { return pSource["Sell/Buy"].toUpperCase(); },
        "Exchange": function(pSource) { return "KuCoin"; },
        "Base amount":   function(pSource) { return pSource["Amount"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource["Amount-Coin"]; },

        "Quote amount":     function(pSource) { return pSource['Filled Price'].replace(/,/g, ''); },
        "Quote currency":   function(pSource) { return pSource['Price-Coin']; },

        "Fee":              function(pSource) { return pSource['Fee'].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['Fee-Coin']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "KuCoin 2.0": {
        "_KnownCSVColumns": function(pSource)  { return "tradeCreatedAt,symbol,side,price,size,funds,fee,".split(","); },

        "Date":     function(pSource) {
            date = moment(pSource['tradeCreatedAt'], "DD/MM/YYYY, hh:mm aa");
            return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) { return pSource["side"].toUpperCase(); },
        "Exchange": function(pSource) { return "KuCoin"; },
        "Base amount":   function(pSource) { return pSource["funds"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['symbol'].split('-')[0] },

        "Quote amount":     function(pSource) { return pSource['size'].replace(/,/g, ''); },
        "Quote currency":   function(pSource) { return pSource['symbol'].split('-')[1] },
        "Fee":              function(pSource) { return pSource['fee'].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['symbol'].split('-')[1] },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Bittrex": {
        "_KnownCSVColumns": function(pSource)  { return "OrderUuid,Exchange,Type,Quantity,Limit,CommissionPaid,Price,Opened,Closed,TimeStamp,OrderType,Commission".split(","); },

        "Date":             function(pSource) {
            var date = undefined;
            if(pSource['Opened']){
                date = pSource['Opened'];
            }else if(pSource['TimeStamp']){
                date = pSource['TimeStamp'];
            }
            var a = moment(date, "MM/DD/YYYY hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z"); },
        "Type":             function(pSource) {
            var type = undefined;
            if(pSource['Type']){
                type = pSource['Type'];
            }else if(pSource['OrderType']){
                type = pSource['OrderType'];
            }
            switch(type) {
                case "LIMIT_SELL":
                    return "SELL";
                case "LIMIT_BUY":
                    return "BUY";
            }},
        "Exchange": function(pSource) { return "Bittrex"; },

        "Base amount":     function(pSource) { return pSource['Quantity'].replace(/,/g, ''); },
        "Base currency": function(pSource) {
            pos = pSource["Exchange"].indexOf("-");
            base = pSource["Exchange"].substring(pos+1);
            if(base == "BCC")
                base = "BCH";

            if(base=="BSD")
                base="BSD*";

            return base;
        },

        "Quote amount":   function(pSource) { return pSource["Price"].replace(/,/g, ''); },
        "Quote currency": function(pSource) {
            pos = pSource["Exchange"].indexOf("-");
            quote = pSource["Exchange"].substring(0,  pos);
            if(quote == "BCC")
                quote = "BCH";
            if(base=="BSD")
                base="BSD*";
            return quote;
        },

        "Fee":              function(pSource) {
            if(pSource['CommissionPaid']){
                return pSource['CommissionPaid'];
            }else if(pSource['Commission']){
                return pSource['Commission']
            }
            return ""; },
        "Fee currency": function(pSource) {
            pos = pSource["Exchange"].indexOf("-");
            return pSource["Exchange"].substring(0,  pos);
        },
        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Coinspot": {
        "_KnownCSVColumns": function(pSource)  { return "Transaction Date,Type,Market,Amount,Rate inc. fee,Rate ex. fee,Fee,Fee AUD (inc GST),GST AUD,Total AUD,Total (inc GST)".split(","); },

        "Date":     function(pSource) { return pSource["Transaction Date"]; },
        "Type":     function(pSource) { return pSource["Type"].toUpperCase(); },
        "Exchange": function(pSource) { return "Coinspot"; },

        "Base amount":     function(pSource) { return pSource['Amount'].replace(/,/g, ''); },
        "Base currency": function(pSource) {
            pos = pSource["Market"].indexOf("/");
            base = pSource["Market"].substring(0, pos);
            if(base == "BCC")
                base = "BCH";

            if(base=="BSD")
                base="BSD*";

            return base;
        },

        "Quote amount":   function(pSource) { return pSource["Rate ex. fee"].replace(/,/g, ''); },
        "Quote currency": function(pSource) {
            pos = pSource["Market"].indexOf("/");
            quote = pSource["Market"].substring(pos + 1);
            if(quote == "BCC")
                quote = "BCH";
            if(base=="BSD")
                base="BSD*";
            return quote;
        },

        "Fee":              function(pSource) { return pSource['Fee'].split(' ')[0]; },
        "Fee currency": function(pSource) { return pSource['Fee'].split(' ')[1] },
        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Coinbase": {
        "_KnownCSVColumns": function(pSource){ return "Timestamp,Transaction Type,Asset,Quantity Transacted,USD Spot Price at Transaction,USD Amount Transacted (Inclusive of Coinbase Fees),Address,Notes".split(",");},
        "Date": function(pSource) {
            var a = moment(pSource['Timestamp'], "MM/DD/YYYY hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type": function(pSource) {
            var type = pSource["Transaction Type"].toUpperCase();
            switch(type) {
                case "RECEIVE":
                    return "TRANSFER";
                    break;
                case "SEND":
                    return "TRANSFER";
                    break;
                case "TRADE":
                    return "SELL";
                    break;
                default:
                    return type;
            }
            },
        "Exchange": function(pSource) { return "Coinbase"; },
        "Base amount":   function(pSource) { return pSource["Quantity Transacted"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['Asset']; },

        "Quote amount":     function(pSource) {
            var amount = pSource['USD Amount Transacted (Inclusive of Coinbase Fees)'];
            var type = pSource["Transaction Type"].toUpperCase();

            switch(type){
                case "RECEIVE":
                    return "";
                    break;
                case "SEND":
                    return "";
                    break;
                default:
                    return amount.replace(/,/g, '');
            }
            },
        "Quote currency":   function(pSource) {
            var currency = "USD";
            var type = pSource["Transaction Type"].toUpperCase();
            switch(type){
                case "RECEIVE":
                    return "";
                    break;
                case "SEND":
                    return "";
                    break;
                default:
                    return currency;
            }
            },

        "Fee":              function(pSource) { return ""; },
        "Fee currency":     function(pSource) { return ""; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            var type = pSource["Transaction Type"].toUpperCase();
            switch(type){
                case "SEND":
                    return "My_Wallet";
                    break;
                case "RECEIVE":
                    return "My_Wallet";
                default:
                    return "";
            }
            },
        "Sent to":                 function(pSource) {
            var type = pSource["Transaction Type"].toUpperCase();
            switch(type){
                case "SEND":
                    return "My_Wallet";
                    break;
                case "RECEIVE":
                    return "My_Wallet";
                    break;
                default:
                    return "";
            }
        },
        "Notes":                   function(pSource) { return pSource["Notes"].replace(/\r?\n|\r|,/g, ' '); }

    },

    "Bitfinex": {
        "_KnownCSVColumns": function(pSource)  { return "#,PAIR,AMOUNT,PRICE,FEE,FEE CURRENCY,DATE,ORDER ID".split(","); },

        "Date": function(pSource) {
            var a = moment(pSource['DATE'], "MM/DD/YYYY hh:mm aa");
            var date = a.utc().format("YYYY-MM-DD hh:mm:ss Z");
            if(date == "Invalid date"){
               var b = moment(pSource['DATE'], "DD/MM/YYYY hh:mm aa");
               date = b.utc().format("YYYY-MM-DD hh:mm:ss Z");
            }

            return date;
        },
        "Type":     function(pSource) {
            if(pSource['AMOUNT'] > 0){
                return "BUY";
            }else{
                return "SELL";
            }
            return "TRANSFER"; },
        "Exchange": function(pSource) { return "Bitfinex"; },
        "Base amount":   function(pSource) { return pSource["AMOUNT"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['PAIR'].split('/')[0] },

        "Quote amount":     function(pSource) {
            var quote = Math.abs(pSource['AMOUNT']*pSource['PRICE']);
            return  quote.toString().replace(/,/g, '');
            },
        "Quote currency":   function(pSource) { return pSource['PAIR'].split('/')[1] },

        "Fee":              function(pSource) { return pSource['FEE'].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['FEE CURRENCY']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Coinbase Pro": {
        "_KnownCSVColumns": function(pSource)  { return "trade id,product,side,created at,size,size unit,price,fee,total,proce/fee/total unit".split(","); },
        "Date":     function(pSource) {
            date = moment(pSource['created at'], "YYYY-MM-DD, hh:mm aa");
            return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) { return pSource["side"].toUpperCase(); },
        "Exchange": function(pSource) { return "Coinbase Pro"; },
        "Base amount":   function(pSource) { return pSource["size"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['product'].split('-')[0] },

        "Quote amount":     function(pSource) { return Math.abs(pSource['total'].replace(/,/g, '')) },
        "Quote currency":   function(pSource) { return pSource['product'].split('-')[1] },

        "Fee":              function(pSource) { return pSource['fee']; },
        "Fee currency":     function(pSource) { return pSource['product'].split('-')[1] },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Poloniex": {
        "_KnownCSVColumns": function(pSource)  { return "Date,Market,Category,Type,Price,Amount,Total,Fee,Order Number,Base Total Less Fee,Quote Total Less Fee".split(","); },

        "Date": function(pSource) {
            var a = moment(pSource['Date'], "MM/DD/YYYY hh:mm aa");
            var date = a.utc().format("YYYY-MM-DD hh:mm:ss Z");
            if(date == "Invalid date"){
                var b = moment(pSource['Date'], "DD/MM/YYYY hh:mm aa");
                date = b.utc().format("YYYY-MM-DD hh:mm:ss Z");
            }

            return date;
        },
        "Type":     function(pSource) { return pSource["Type"].toUpperCase(); },
        "Exchange": function(pSource) { return "Poloniex"; },
        "Base amount":   function(pSource) { return pSource["Amount"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['Market'].split('/')[1] },

        "Quote amount":     function(pSource) { return pSource['Total'].replace(/,/g, '') },
        "Quote currency":   function(pSource) { return pSource['Market'].split('/')[0] },

        "Fee":              function(pSource) {
            var fee = pSource["Total"]*(pSource["Fee"].replace('%',"")/100);
            return fee;
        },
        "Fee currency":     function(pSource) { return pSource['Market'].split('/')[1]; },
        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Gemini": {
        "_KnownCSVColumns": function(pSource)  { return "Date,Time (UTC),Type,Symbol,Specification,Liquidity Indicator,Trading Fee Rate (bps),USD Amount USD,Fee (USD) USD,USD Balance USD,BTC Amount BTC,Fee (BTC) BTC,BTC Balance BTC,ETH Amount ETH,Fee (ETH) ETH,ETH Balance ETH,ZEC Amount ZEC,Fee ZEC,ZEC Balance ZEC,BCH Amount BCH,Fee (BCH) BCH,BCH Balance BCH,LTC Amount LTC,Fee (LTC) LTC,LTC Balance LTC,Trade ID,Order ID,Order Date,Order Time,Client Order ID,API Session,Tx Hash,Deposit Destination,Deposit Tx Output,Withdrawal Destination,Withdrawal Tx Output".split(","); },

        "Date":     function(pSource) {
            var date = pSource["Date"] + " " + pSource["Time (UTC)"];
            var a = moment(date, "YYYY-MM-DD hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z");
            },
        "Type":     function(pSource) {
            var type = pSource['Type'];
            switch(type){
                case 'Credit':
                    return 'DEPOSIT';
                case 'Debit':
                    return 'WITHDRAW';
                default:
                    return pSource['Type'].toUpperCase();
            }
        },
        "Exchange": function(pSource) {
            return "Gemini"; },
        "Base amount":   function(pSource) {
            var type = pSource['Type'];
            var symbol = undefined;
            if(type === 'Credit' || type === 'Debit'){
                symbol =  pSource['Symbol'];
            }else{
                symbol =  pSource['Symbol'].slice(0,3);
            }
            if(!symbol){
                return '';
            }

            var target = symbol + ' Amount ' + symbol;

            var temp = pSource[target];

            var regex = ['$','(',')',',','-'];
            regex.map(e => {
                temp = temp.replace(e, '');
            });
            return temp.split(' ')[0];

        },
        "Base currency": function(pSource) {
            var type = pSource['Type'];
            if(type == 'Credit' || type == 'Debit'){
                return pSource['Symbol'];
            }else{
                return pSource['Symbol'].slice(0,3);
            }
        },

        "Quote amount":     function(pSource) {
            var type = pSource['Type'];
            var symbol = undefined;
            if(type == 'Credit' || type == 'Debit'){
                return '';
            }else{
                symbol =  pSource['Symbol'].slice(-3);
            }
            if(!symbol){
                return '';
            }
            var target = symbol + ' Amount ' + symbol;
            var temp = pSource[target];

            var regex = ['$','(',')',',','-'];
            regex.map(e => {
                temp = temp.replace(e, '');
            });
            return temp.split(' ')[0];
        },
        "Quote currency":   function(pSource) {
            var type = pSource['Type'];
            if(type == 'Credit' || type == 'Debit'){
                return '';
            }else{

                return pSource['Symbol'].slice(-3);
            }
        },

        "Fee":              function(pSource) {
            var type = pSource['Type'];
            var symbol = undefined;
            if(type == 'Credit' || type == 'Debit'){
                return '';
            }else{
                symbol =  pSource['Symbol'].slice(-3);
            }
            if(!symbol){
                return '';
            }
            var target = 'Fee (' + symbol + ') ' + symbol;
            var temp = pSource[target];

            var regex = ['$','(',')',',','-'];
            regex.map(e => {
                temp = temp.replace(e, '');
            });
            return temp.split(' ')[0];
        },
        "Fee currency":     function(pSource) {
            var type = pSource['Type'];
            if(type == 'Credit' || type == 'Debit'){
                return '';
            }else{

                return pSource['Symbol'].slice(-3);
            }
        },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            var type = pSource['Type'];
            switch(type){
                case 'Credit':
                    return 'Other_Wallet';
                case 'Debit':
                    return 'My_Wallet';
                default:
                    return '';
            }
        },
        "Sent to":                 function(pSource) {
            var type = pSource['Type'];
            switch(type){
                case 'Credit':
                    return 'My_Wallet';
                case 'Debit':
                    return 'Other_Wallet';
                default:
                    return '';
            }
        },
        "Notes":                   function(pSource) { return ""; }
    },

    "OKEX" :  {
        "_KnownCSVColumns": function(pSource)  { return "tradingTime,type,price,size,balance,fee,symbol".split(","); },

        "Date":     function(pSource) {
            var a = moment(pSource["tradingTime"], "YYYY-MM-DD hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'Sell':
                    return 'SELL';
                case 'Buy':
                    return 'BUY';
                case 'To margin':
                    return 'WITHDRAW';
                case 'From margin':
                    return 'DEPOSIT';
                case 'To Fund':
                    return 'WITHDRAW';
                case 'From Fund':
                    return 'DEPOSIT';
                case 'To wallet':
                    return 'WITHDRAW';
                case 'From wallet':
                    return 'DEPOSIT';
                default:
                    return '';
            }
        },
        "Exchange": function(pSource) { return "OKEX"; },
        "Base amount":   function(pSource) { return Math.abs(pSource["size"].replace(/,/g, '')); },
        "Base currency": function(pSource) { return pSource["symbol"]; },

        "Quote amount":     function(pSource) {
            var quote = Math.abs(pSource['price']*pSource['size']);
            var type = pSource['type'];
            switch(type){
                case 'To margin':
                    return '';
                case 'From margin':
                    return '';
                case 'To Fund':
                    return '';
                case 'From Fund':
                    return '';
                case 'To wallet':
                    return '';
                case 'From wallet':
                    return '';
                default:
                    return quote;
            }
        },
        "Quote currency":   function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'To margin':
                    return '';
                case 'From margin':
                    return '';
                case 'To Fund':
                    return '';
                case 'From Fund':
                    return '';
                case 'To wallet':
                    return '';
                case 'From wallet':
                    return '';
                default:
                    return "USDT";
            }
            },

        "Fee":              function(pSource) { return pSource['fee']; },
        "Fee currency":     function(pSource) { return pSource['symbol']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'To margin':
                    return 'My_Wallet';
                case 'From margin':
                    return 'Other_Wallet';
                case 'To Fund':
                    return 'My_Wallet';
                case 'From Fund':
                    return 'Other_Wallet';
                case 'To wallet':
                    return 'My_Wallet';
                case 'From wallet':
                    return 'Other_Wallet';
                default:
                    return "";
            }
        },
        "Sent to":                 function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'To margin':
                    return 'Other_Wallet';
                case 'From margin':
                    return 'My_Wallet';
                case 'To Fund':
                    return 'Other_Wallet';
                case 'From Fund':
                    return 'My_Wallet';
                case 'To wallet':
                    return 'Other_Wallet';
                case 'From wallet':
                    return 'My_Wallet';
                default:
                    return "";
            }
        },
        "Notes":                   function(pSource) { return ""; }
    },

    'CoinJar': {
        "_KnownCSVColumns": function(pSource)  { return "Uuid,Transacted at,Account,Amount formatted,Amount currency,Amount decimal,Description,Pending,Destination amount,Quote,Fees".split(","); },

        "Date":     function(pSource) {
            var temp = pSource["Transacted at"].split(' ').splice(0,2).join(' ');
            var a = moment(temp, "YYYY-MM-DD hh:mm aa");
            var date = a.utc().format("YYYY-MM-DD hh:mm:ss Z");
            return date;
            },
        "Type":     function(pSource) {
            var amount = pSource['Amount decimal'];
            if(amount > 0){
                return 'DEPOSIT';
            }else{
                return 'WITHDRAW';
            }

        },
        "Exchange": function(pSource) { return "CoinJar"; },
        "Base amount":   function(pSource) {
            return Math.abs(pSource['Amount decimal'].replace(/,/g, ''));
        },
        "Base currency": function(pSource) {
            return pSource["Amount currency"];
        },

        "Quote amount":     function(pSource) {
            return '';
        },
        "Quote currency":   function(pSource) {
            return '';
        },

        "Fee":              function(pSource) { return pSource['Fees'].replace(/,/g, ''); },
        "Fee currency":     function(pSource) {
            if (pSource['Fees'])
                return pSource["Amount currency"];
            else
                return '';
        },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            var amount = pSource['Amount decimal'];
            var quote = pSource['Quote'];
            var currency = pSource['Amount currency'];
            if(currency == 'AUD' || currency == 'USD' || currency == 'GBP' || currency == 'EUR'){
                if(amount > 0){
                    // if(!quote)
                        return 'Other_Wallet';
                }else{
                    // if(!quote)
                        return 'My_Wallet';
                }
            }else{
                if(amount > 0){
                    // if(!quote)
                        return 'Other_Wallet';
                }else{
                    // if(!quote)
                        return 'My_Wallet';
                }
            }
            return '';
        },
        "Sent to":                 function(pSource) {
            var amount = pSource['Amount decimal'];
            var quote = pSource['Quote'];
            var currency = pSource['Amount currency'];
            if(currency == 'AUD' || currency == 'USD' || currency == 'GBP' || currency == 'EUR'){
                if(amount > 0){
                    // if(!quote)
                        return 'My_Wallet';
                }else{
                    // if(!quote)
                        return 'Other_Wallet';
                }
            }else{
                if(amount > 0){
                    // if(!quote)
                        return 'My_Wallet';
                }else{
                    // if(!quote)
                        return 'Other_Wallet';
                }
            }
            return '';
        },
        "Notes":                   function(pSource) {
            var des = pSource['Description'];
            des = des.replace(/\r?\n|\r|,/g, ' ');
            return des;

        }
    },

    'CoinTracking': {
        "_KnownCSVColumns": function(pSource)  { return "Amount,Currency,Date Acquired,Date Sold,Short/Long,Buy /Input at,Sell /Output at,Proceeds in AUD,Cost Basis in AUD,Gain/Loss in AUD".split(","); },

        "Date":     function(pSource) {
            date = moment(pSource['Date Acquired'], "DD/MM/YYYY hh:mm:ss");
            return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) {
            if(pSource['Currency'] == 'USD' || pSource['Currency'] == 'EUR' || pSource['Currency'] == 'AUD'){
                return 'DEPOSIT'
            }else{
                return 'TRANSFER';
            }
        },
        "Exchange": function(pSource) {
            return pSource['Sell /Output at'];
        },
        "Base amount":   function(pSource) { return pSource["Amount"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['Currency']; },

        "Quote amount":     function(pSource) { return ''; },
        "Quote currency":   function(pSource) { return ''; },
        "Fee":              function(pSource) { return ''; },
        "Fee currency":     function(pSource) { return ''; },

        "Costs/Proceeds":          function(pSource) {
            if(pSource['Buy /Input at'] && pSource['Cost Basis in AUD'] != 0){
                return pSource['Cost Basis in AUD'].replace(/,/g, '');
            }else{
                return '';
            }
        },
        "Costs/Proceeds currency": function(pSource) {
            if(pSource['Buy /Input at'] && pSource['Cost Basis in AUD'] != 0){
                return 'AUD';
            }else{
                return '';
            }
        },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            if(pSource['Currency'] == 'USD' || pSource['Currency'] == 'EUR' || pSource['Currency'] == 'AUD'){
                return '';
            }else{
                if(!pSource['Buy /Input at']){
                    return pSource['Sell /Output at'];
                }else{
                    return pSource['Buy /Input at'].split(' ')[0];
                }
            }
        },
        "Sent to":                 function(pSource) {
            if(pSource['Currency'] == 'USD' || pSource['Currency'] == 'EUR' || pSource['Currency'] == 'AUD'){
                return '';
            }else{
                return pSource['Sell /Output at'];
            }
        },
        "Notes":                   function(pSource) {
            var notes = "Gain/Loss " + pSource['Gain/Loss in AUD'] + 'AUD';
            return notes.replace(/\r?\n|\r|,/g, ' ');
        }
    },

    'CoinTracking_closeing_Position': {
        "_KnownCSVColumns": function(pSource)  { return "Amount Remaining Assets,Currency Asset Currency,Date Acquired Asset Purchase Date,Buy/Input at Place of input,Purchase Price in AUD Per Asset,Year End Price in AUDPer Asset on 31.12.2017,Cost Basis in AUD Total Purchase Value,Year End Value in AUD Total Year End Value,Gain/Loss in AUD Total Year End Gain/Loss,".split(","); },

        "Date":     function(pSource) {
            date = moment(pSource['Date Acquired Asset Purchase Date'], "DD.MM.YYYY");
            return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) { return 'BUY' },
        "Exchange": function(pSource) {
            return '';
            // return pSource['Buy/Input at Place of input'].split(' ')[0];
        },
        "Base amount":   function(pSource) { return pSource["Amount Remaining Assets"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['Currency Asset Currency']; },

        "Quote amount":     function(pSource) { return pSource['Cost Basis in AUD Total Purchase Value'].replace(/,/g, ''); },
        "Quote currency":   function(pSource) { return "AUD" },

        "Fee":              function(pSource) { return ''; },
        "Fee currency":     function(pSource) { return ''; },

        "Costs/Proceeds":          function(pSource) { return ''; },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) {
            var notes = "Gain/Loss in AUD Total Year End" + pSource['Gain/Loss in AUD Total Year End Gain/Loss'] + 'AUD';
            return notes.replace(/\r?\n|\r|,/g, ' ');
        }
    },

    'Kraken': {
        "_KnownCSVColumns": function(pSource)  { return "txid,ordertxid,pair,time,type,ordertype,price,cost,fee,vol,margin,misc,ledgers".split(","); },

        "Date":     function(pSource) {
            var temp = moment(pSource['time'], "DD/MM/YYYY hh:mm:ss");
            var date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");

            if(date == "Invalid date"){
                temp = moment('01/01/2018', "DD/MM/YYYY hh:mm:ss");
                date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");
            }

            return date;
        },
        "Type":     function(pSource) {
            return pSource['type'].toUpperCase();
        },
        "Exchange": function(pSource) {
            return 'Kraken';
            // return pSource['Buy/Input at Place of input'].split(' ')[0];
        },
        "Base amount":   function(pSource) { return pSource["vol"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['pair'].slice(1,4); },

        "Quote amount":     function(pSource) { return pSource['cost'].replace(/,/g, ''); },
        "Quote currency":   function(pSource) { return pSource['pair'].slice(-3); },

        "Fee":              function(pSource) { return pSource["fee"].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['pair'].slice(-3); },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) { return "1"; },
        "Sent/Received from":      function(pSource) { return ''; },
        "Sent to":                 function(pSource) { return '';},
        "Notes":                   function(pSource) { return '';}
    },

    'Kraken_legers': {
        "_KnownCSVColumns": function(pSource)  { return "txid,refid,time,type,aclass,asset,amount,fee,balance".split(","); },

        "Date":     function(pSource) {
            var temp = moment(pSource['time'], "DD/MM/YYYY hh:mm:ss");
            var date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");

            if(date == "Invalid date"){
                temp = moment('01/01/2018', "DD/MM/YYYY hh:mm:ss");
                date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");
            }

            return date;
        },
        "Type":     function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'deposit':
                    return "DEPOSIT";
                case 'withdrawal':
                    return "WITHDRAW";
                case 'trade':
                    if(pSource['amount'] > 0)
                        return 'WITHDRAW';
                    else
                        return 'DEPOSIT';
                default:
                    return '';
            }
        },
        "Exchange": function(pSource) {
            return 'Kraken';
            // return pSource['Buy/Input at Place of input'].split(' ')[0];
        },
        "Base amount":   function(pSource) { return pSource["amount"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['asset'].slice(1); },

        "Quote amount":     function(pSource) { return '';  },
        "Quote currency":   function(pSource) { return ''; },

        "Fee":              function(pSource) { return pSource["fee"].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['asset'].slice(1); },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'deposit':
                    return "Other_Wallet";
                case 'withdrawal':
                    return "My_Wallet";
                case 'trade':
                    if(pSource['amount'] > 0)
                        return 'My_Wallet';
                    else
                        return 'Other_Wallet';
                default:
                    return '';
            }
        },
        "Sent to":                 function(pSource) {
            var type = pSource['type'];
            switch(type){
                case 'deposit':
                    return "My_Wallet";
                case 'withdrawal':
                    return "Other_Wallet";
                case 'trade':
                    if(pSource['amount'] > 0)
                        return 'Other_Wallet';
                    else
                        return 'My_Wallet';
                default:
                    return '';
            }
        },
        "Notes":                   function(pSource) {
           return '';
        }
    },

    'IDEX': {
        "_KnownCSVColumns": function(pSource)  { return "transactionId,transactionHash,date,market,makerOrTaker,buyOrSell,tokenAmount,etherAmount,usdValue,fee,gasFee,feesPaidIn".split(","); },

        "Date":     function(pSource) {
            var temp = moment(pSource['date'], "DD/MM/YYYY hh:mm");
            var date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");

            return date;
        },
        "Type":     function(pSource) {
            return pSource['buyOrSell'].toUpperCase();
        },
        "Exchange": function(pSource) {
            return 'IDEX';
            // return pSource['Buy/Input at Place of input'].split(' ')[0];
        },
        "Base amount":   function(pSource) { return pSource["tokenAmount"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['market'].split('/')[0]; },

        "Quote amount":     function(pSource) { return pSource['etherAmount'].replace(/,/g, ''); },
        "Quote currency":   function(pSource) { return pSource['market'].split('/')[1]; },

        "Fee":              function(pSource) { return pSource["fee"].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['feesPaidIn']; },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) {
            if(pSource['buyOrSell'].toUpperCase() == 'BUY' || pSource['buyOrSell'].toUpperCase() == 'SELL')
                return '1';
            else
                return ''
        },
        "Sent/Received from":      function(pSource) { return ''; },
        "Sent to":                 function(pSource) { return '';},
        "Notes":                   function(pSource) { return '';}
    },

    'Houbi': {
        "_KnownCSVColumns": function(pSource)  { return "uid,f_symbol,deal_time,deal_type,f_price,f_filled_amount,f_filled_cash_amount,fees".split(","); },

        "Date":     function(pSource) {
            var temp = moment(pSource['deal_time'], "DD/MM/YYYY hh:mm");
            var date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");

            return date;
        },
        "Type":     function(pSource) {
            return pSource['deal_type'].toUpperCase();
        },
        "Exchange": function(pSource) {
            return '';
            // return pSource['Buy/Input at Place of input'].split(' ')[0];
        },
        "Base amount":   function(pSource) { return pSource["f_filled_amount"].replace(/,/g, ''); },
        "Base currency": function(pSource) {
            return pSource['f_symbol'].slice(-pSource['f_symbol'].length, -3).toUpperCase();
         },

        "Quote amount":     function(pSource) { return pSource['f_filled_cash_amount'].replace(/,/g, ''); },
        "Quote currency":   function(pSource) { return pSource['f_symbol'].slice(-3).toUpperCase(); },

        "Fee":              function(pSource) { return pSource["fees"].replace(/,/g, ''); },
        "Fee currency":     function(pSource) {
            return pSource['f_symbol'].slice(-pSource['f_symbol'].length, -3).toUpperCase();
        },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) {
            if(pSource['deal_type'] == 'buy' || pSource['deal_type'] == 'sell')
                return '1';
            else
                return ''
         },
        "Sent/Received from":      function(pSource) { return ''; },
        "Sent to":                 function(pSource) { return '';},
        "Notes":                   function(pSource) { return '';}
    },

    'Stocks.exchange': {
        "_KnownCSVColumns": function(pSource)  { return "Date,Buy,Buy amount,Price,Sell,Sell Amount,Document,Operation,Fee,Fee Asset".split(","); },

        "Date":     function(pSource) {
            var temp = moment(pSource['Date'], "YYYY-MM-DD hh:mm:ss");
            var date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");
            return date;
        },
        "Type":     function(pSource) {
            type = pSource['Operation'].toUpperCase();
            switch(type){
                case 'ORDER':
                    return 'BUY';
                default:
                    return type;
            }
        },
        "Exchange": function(pSource) {
            return '';
        },
        "Base amount":   function(pSource) {
            var base = pSource["Buy amount"].replace(/,/g, '');
            var quote = pSource['Sell Amount'].replace(/,/g, '');
            var type = pSource['Operation'].toUpperCase();
            switch(type){
                case 'WITHDRAW':
                    return quote;
                case 'DEPOSIT':
                    return quote;
                default:
                    return base;
            }
            },
        "Base currency": function(pSource) {
            var base_cur = pSource['Buy'];
            var quote_cur = pSource['Sell'];
            switch(type){
                case 'WITHDRAW':
                    return quote_cur;
                case 'DEPOSIT':
                    return quote_cur;
                default:
                    return base_cur;
            }
        },

        "Quote amount":     function(pSource) {
            var quote = pSource['Sell Amount'].replace(/,/g, '');
            var type = pSource['Operation'].toUpperCase();
            switch(type){
                case 'WITHDRAW':
                    return '';
                case 'DEPOSIT':
                    return '';
                default:
                    return quote;
            }
        },
        "Quote currency":   function(pSource) {
            var quote_cur = pSource['Sell'];
            switch(type){
                case 'WITHDRAW':
                    return '';
                case 'DEPOSIT':
                    return '';
                default:
                    return quote_cur;
            }
        },

        "Fee":              function(pSource) {
            var fee = pSource['Fee'].replace(/,/g, '');
            if(fee == 0)
                return '';
            else
                return fee;

        },
        "Fee currency":     function(pSource) {
            var fee_asset = pSource['Fee Asset'];
            var fee = pSource['Fee'].replace(/,/g, '');
            if(fee == 0)
                return '';
            else
                return fee_asset;
        },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) {
            if(pSource['Operation'] == 'Order' || pSource['Operation'] == 'Sell' || pSource['Operation'] == 'Buy')
                return '1';
            else
                return ''
        },
        "Sent/Received from":      function(pSource) {
            type = pSource['Operation'].toUpperCase();
            switch(type){
                case 'WITHDRAW':
                    return 'My_Wallet';
                case 'DEPOSIT':
                    return 'Other_Wallet';
                default:
                    return '';
            }
        },
        "Sent to":                 function(pSource) {
            type = pSource['Operation'].toUpperCase();
            switch(type){
                case 'WITHDRAW':
                    return 'Other_Wallet';
                case 'DEPOSIT':
                    return 'My_Wallet';
                default:
                    return '';
            }
        },
        "Notes":                   function(pSource) { return '';}
    },

    'CoinTracker': {
        "_KnownCSVColumns": function(pSource)  { return "Date,Type,Received Quantity,Received Currency,Received Currency Balance,Received Cost Basis (AUD),Received Wallet Type,Received Wallet,Received Tag,Received Comment,Sent Quantity,Sent Currency,Sent Currency Balance,Sent Cost Basis (AUD),Sent Wallet Type,Sent Wallet,Sent Tag,Sent Comment,Realized Return (AUD),Disabled".split(","); },

        "Date":     function(pSource) {
            var temp = moment(pSource['Date'], "MM/DD/YYYY hh:mm");
            var date = temp.utc().format("YYYY-MM-DD hh:mm:ss Z");

            return date;
        },
        "Type":     function(pSource) {
           var type = pSource['Type'].toUpperCase();
           switch(type){
               case 'RECEIVE':
                   return 'DEPOSIT';
               case 'SEND':
                   return 'WITHDRAW';
               case 'TRADE':
                   return 'BUY';
               default:
                   return type;
           }

        },
        "Exchange": function(pSource) {
            var type = pSource['Type'].toUpperCase();
            var exchange_place = pSource['Received Wallet Type'];
            switch(type){
                case 'RECEIVE':
                    return '';
                case 'SEND':
                    return '';
                default:
                    return exchange_place;
            }
        },
        "Base amount":   function(pSource) {
            var received = pSource['Received Quantity'].replace(/,/g, '');
            var sent = pSource['Sent Quantity'].replace(/,/g, '');
            var received_cur = pSource['Received Currency'];
            var type = pSource['Type'].toUpperCase();
            switch (type) {
                case 'SEND':
                    return sent;
                case 'SELL':
                    return sent;
                case 'TRADE':
                    if(received_cur === 'BTC' || received_cur === 'BNB' || received_cur === 'ETH')
                        return sent;
                    else
                        return received;
                default:
                    return received;
            }
        },
        "Base currency": function(pSource) {
            var received_cur = pSource['Received Currency'];
            var sent_cur = pSource['Sent Currency'];
            var type = pSource['Type'].toUpperCase();
            switch (type) {
                case 'SEND':
                    return sent_cur;
                case 'SELL':
                    return sent_cur;
                case 'TRADE':
                    if(received_cur === 'BTC'|| received_cur === 'BNB' || received_cur === 'ETH')
                        return sent_cur;
                    else
                        return received_cur;
                default:
                    return received_cur;
            }
        },

        "Quote amount":     function(pSource) {
            var received = pSource['Received Quantity'].replace(/,/g, '');
            var received_cur = pSource['Received Currency'];
            var sent = pSource['Sent Quantity'].replace(/,/g, '');
            var type = pSource['Type'].toUpperCase();
            switch (type) {
                case 'SEND':
                    return '';
                case 'SELL':
                    return received;
                case 'TRANSFER':
                    return '';
                case 'TRADE':
                    if(received_cur === 'BTC'|| received_cur === 'BNB' || received_cur === 'ETH')
                        return received;
                    else
                        return sent;
                default:
                    return sent;
            }
        },
        "Quote currency":   function(pSource) {
            var received_cur = pSource['Received Currency'];
            var sent_cur = pSource['Sent Currency'];
            var type = pSource['Type'].toUpperCase();
            switch (type) {
                case 'SEND':
                    return '';
                case 'SELL':
                    return received_cur;
                case 'TRANSFER':
                    return '';
                case 'TRADE':
                    if(received_cur === 'BTC'|| received_cur === 'BNB' || received_cur === 'ETH')
                        return received_cur;
                    else
                        return sent_cur;
                default:
                    return sent_cur;
            }
        },

        "Fee":              function(pSource) { return ''; },
        "Fee currency":     function(pSource) { return ''; },

        "Costs/Proceeds":          function(pSource) { return '' },
        "Costs/Proceeds currency": function(pSource) { return ''; },
        "Sync Holdings":           function(pSource) {
            var type = pSource['Type'].toUpperCase();
            if(type === 'BUY' || type === 'SELL')
                return '1';
            else
                return ''
        },
        "Sent/Received from":      function(pSource) {
            var type = pSource['Type'].toUpperCase();
            var received_type = pSource['Received Wallet Type'];
            var sent_type = pSource['Sent Wallet Type'];

            switch(type){
                case 'SEND':
                    return 'My_Wallet';
                case 'RECEIVE':
                    return 'Other_Wallet';
                case 'TRANSFER':
                    if(received_type == 'Local Wallet')
                        return sent_type;
                    else
                        return received_type;
                default:
                    return '';
            }
        },
        "Sent to":                 function(pSource) {
            var type = pSource['Type'].toUpperCase();
            var received_type = pSource['Received Wallet Type'];
            var sent_type = pSource['Sent Wallet Type'];
            switch(type){
                case 'SEND':
                    return 'Other_Wallet';
                case 'RECEIVE':
                    return 'My_Wallet';
                case 'TRANSFER':
                    return 'My_Wallet';
                default:
                    return '';
            }
            },
        "Notes":                   function(pSource) { return '';}
    },

    'BTCMarkets': {
        "_KnownCSVColumns": function(pSource)  { return "transactionId,creationTime,recordType,action,currency,amount,description,balance,referenceId".split(","); },

        "Date":     function(pSource) {
            date = moment(pSource['creationTime'], "YYYY-MM-DD, hh:mm aa");
            return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) {
            var type = pSource['action'];
            switch(type){
                case 'Deposit':
                    return 'DEPOSIT';
                case 'Withdraw':
                    return 'WITHDRAW';
                case 'Buy Order':
                    return 'BUY';
                case 'Sell Order':
                    return 'SELL';
                case 'Trading Fee':
                    return 'BUY';
                default:
                    return '';
            }
        },
        "Exchange": function(pSource) { return 'BTCMarkets'; },
        "Base amount":   function(pSource) {
            var description = pSource['description'];
            var type = pSource['action'];

            function filterAmount(n){
                var temp = description.split(' ')[n]; // 1, 4
                return Number(temp.replace(/[^0-9\.]+|,/g,"").replace(/,/g, ''));
            }

            var amount = Math.abs(pSource["amount"].toString().replace(/,/g, ''));
            switch(type){
                case 'Deposit':
                    return amount;
                case 'Withdraw':
                    return amount;
                default:
                    return filterAmount(1);
            }
           },
        "Base currency": function(pSource) {
            var description = pSource['description'];
            var type = pSource['action'];
            var currency = pSource['currency'];
            function filterCur(){
                var temp = description.split(' ')[1];
                return temp.replace(/[^a-zA-Z ]/g, "");
            }
            switch(type){
                case 'Deposit':
                    return currency;
                case 'Withdraw':
                    return currency;
                default:
                    return filterCur();
            }
        },

        "Quote amount":     function(pSource) {
            var description = pSource['description'];
            var type = pSource['action'];

            function filterAmount(){
                var temp = description.split(' ')[4]; // 1, 4
                return Number(temp.replace(/[^0-9\.]+|,/g,"").replace(/,/g, ''));
            }
            switch(type){
                case 'Deposit':
                    return '';
                case 'Withdraw':
                    return '';
                default:
                    return filterAmount();
            }
        },
        "Quote currency":   function(pSource) {
            var description = pSource['description'];
            var type = pSource['action'];
            function filterCur(){
                var temp = description.split(' ')[3];
                return temp.replace(/[^a-zA-Z ]/g, "");
            }
            switch(type){
                case 'Deposit':
                    return '';
                case 'Withdraw':
                    return '';
                default:
                    return filterCur();
            }
        },
        "Fee":              function(pSource) { return ''; },
        "Fee currency":     function(pSource) { return ''; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) {
            var type = pSource['action'];
            switch(type){
                case 'Buy Order':
                    return '1';
                case 'Sell Order':
                    return '1';
                case 'Trading Fee':
                    return '1';
                default:
                    return '';
            }
        },
        "Sent/Received from":      function(pSource) {
            var type = pSource['action'];
            switch(type){
                case 'Deposit':
                    return 'Other_Wallet';
                case 'Withdraw':
                    return 'My_Wallet';
                default:
                    return '';
            }
        },
        "Sent to":                 function(pSource) {
            var type = pSource['action'];
            switch(type){
                case 'Deposit':
                    return 'My_Wallet';
                case 'Withdraw':
                    return 'Other_Wallet';
                default:
                    return '';
            }
        },
        "Notes":                   function(pSource) { return pSource['description'].replace(/\r?\n|\r|,/g, ' '); }
    },

    "BTCMarkets_2": {
        "_KnownCSVColumns": function(pSource)  { return "id,creationTime,price,volume,side,instrument,currency,market,fee(Inc tax),feeCurrency,feeInBaseCurrency(Inc tax),taxInBaseCurrency,orderId".split(","); },

        "Date":     function(pSource) {
            date = moment(pSource['creationTime'], "YYYY-MM-DD, hh:mm aa");
            return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
        },
        "Type":     function(pSource) {
            var type = pSource['side'];
            switch(type){
                case 'Bid':
                    return 'BUY';
                case 'Ask':
                    return 'BUY';
                default:
                    return 'SELL';
            }
        },
        "Exchange": function(pSource) { return "BTCMarkets"; },
        "Base amount":   function(pSource) { return pSource["price"].replace(/,/g, ''); },
        "Base currency": function(pSource) { return pSource['instrument']; },

        "Quote amount":     function(pSource) {
            var quote = Math.abs(pSource['volume']*pSource['price']);
            return  quote.toString().replace(/,/g, '');
        },
        "Quote currency":   function(pSource) { return pSource['currency']; },
        "Fee":              function(pSource) { return pSource['fee(Inc tax)'].replace(/,/g, ''); },
        "Fee currency":     function(pSource) { return pSource['feeCurrency']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync Holdings":           function(pSource) { return "1"; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },



};
