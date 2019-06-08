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
        "Sync holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { if(pSource['Type'] == "Sub Account Transfer") return pSource["Account"]; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Binance": {
        // NOTE: The base currency is always last on binance pairs,
        //       however Delta expects the pairs in this format
        "_KnownCSVColumns": function(pSource) { return "Date(UTC),Market,Type,Price,Amount,Total,Fee,Fee Coin".split(","); },
        "Date":     function(pSource) { return pSource["Date(UTC)"]; },
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
        "Sync holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "KuCoin": {
        "_KnownCSVColumns": function(pSource)  { return "Time,Coins,Sell/Buy,Filled Price,Coin,Amount,Coin,Volume,Coin,Fee,Coin".split(","); },
        "_RenameCSVColumns": function(pSource) { return "Time,Coins,Sell/Buy,Filled Price,Price-Coin,Amount,Amount-Coin,Volume,Volume-Coin,Fee,Fee-Coin"},

        "Date":     function(pSource) { return pSource["Time"]; },
        "Type":     function(pSource) { return pSource["Sell/Buy"].toUpperCase(); },
        "Exchange": function(pSource) { return "KuCoin"; },
        "Base amount":   function(pSource) { return pSource["Amount"]; },
        "Base currency": function(pSource) { return pSource["Amount-Coin"]; },

        "Quote amount":     function(pSource) { return pSource['Filled Price']; },
        "Quote currency":   function(pSource) { return pSource['Price-Coin']; },

        "Fee":              function(pSource) { return pSource['Fee']; },
        "Fee currency":     function(pSource) { return pSource['Fee-Coin']; },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "KuCoin 2.0": {
        "_KnownCSVColumns": function(pSource)  { return "tradeCreatedAt,symbol,side,price,size,funds,fee,".split(","); },

        "Date":     function(pSource) { return pSource["Time"]; },
        "Type":     function(pSource) { return pSource["side"].toUpperCase(); },
        "Exchange": function(pSource) { return "KuCoin"; },
        "Base amount":   function(pSource) { return pSource["funds"]; },
        "Base currency": function(pSource) { return pSource['symbol'].split('-')[1] },

        "Quote amount":     function(pSource) { return pSource['size'] },
        "Quote currency":   function(pSource) { return pSource['symbol'].split('-')[0] },

        "Fee":              function(pSource) { return pSource['fee']; },
        "Fee currency":     function(pSource) { return pSource['symbol'].split('-')[1] },

        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Bittrex": {
        "_KnownCSVColumns": function(pSource)  { return "OrderUuid,Exchange,Type,Quantity,Limit,CommissionPaid,Price,Opened,Closed".split(","); },

        "Date":             function(pSource) {
            var a = moment(pSource['Opened'], "MM/DD/YYYY hh:mm aa");
            return a.utc().format("YYYY-MM-DD hh:mm:ss Z"); },
        "Type":             function(pSource) {
            switch(pSource['Type']) {
                case "LIMIT_SELL":
                    return "SELL";
                case "LIMIT_BUY":
                    return "BUY";
            }},
        "Exchange": function(pSource) { return "Bittrex"; },

        "Base amount":     function(pSource) { return pSource['Quantity']; },
        "Base currency": function(pSource) {
            pos = pSource["Exchange"].indexOf("-");
            base = pSource["Exchange"].substring(pos+1);
            if(base == "BCC")
                base = "BCH";

            if(base=="BSD")
                base="BSD*";

            return base;
        },

        "Quote amount":   function(pSource) { return pSource["Price"]; },
        "Quote currency": function(pSource) {
            pos = pSource["Exchange"].indexOf("-");
            quote = pSource["Exchange"].substring(0,  pos);
            if(quote == "BCC")
                quote = "BCH";
            if(base=="BSD")
                base="BSD*";
            return quote;
        },

        "Fee":              function(pSource) { return pSource['CommissionPaid']; },
        "Fee currency": function(pSource) {
            pos = pSource["Exchange"].indexOf("-");
            return pSource["Exchange"].substring(0,  pos);
        },
        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    },

    "Coinspot": {
        "_KnownCSVColumns": function(pSource)  { return "Transaction Date,Type,Market,Amount,Rate inc. fee,Rate ex. fee,Fee,Fee AUD (inc GST),GST AUD,Total AUD,Total (inc GST)".split(","); },

        "Date":     function(pSource) { return pSource["Transaction Date"]; },
        "Type":     function(pSource) { return pSource["Type"].toUpperCase(); },
        "Exchange": function(pSource) { return "Coinspot"; },

        "Base amount":     function(pSource) { return pSource['Amount']; },
        "Base currency": function(pSource) {
            pos = pSource["Market"].indexOf("/");
            base = pSource["Market"].substring(0, pos);
            if(base == "BCC")
                base = "BCH";

            if(base=="BSD")
                base="BSD*";

            return base;
        },

        "Quote amount":   function(pSource) { return pSource["Rate ex. fee"]; },
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
        "Base amount":   function(pSource) { return pSource["Quantity Transacted"]; },
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
                    return amount;
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
                    return "MY_WALLET";
                    break;
                case "RECEIVE":
                    return "MY_WALLET";
                default:
                    return "";
            }
            },
        "Sent to":                 function(pSource) {
            var type = pSource["Transaction Type"].toUpperCase();
            switch(type){
                case "SEND":
                    return "MY_WALLET";
                    break;
                case "RECEIVE":
                    return "MY_WALLET";
                    break;
                default:
                    return "";
            }
        },
        "Notes":                   function(pSource) { return pSource["Notes"]; }

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
        "Base amount":   function(pSource) { return pSource["AMOUNT"]; },
        "Base currency": function(pSource) { return pSource['PAIR'].split('/')[0] },

        "Quote amount":     function(pSource) { return pSource['PRICE'] },
        "Quote currency":   function(pSource) { return pSource['PAIR'].split('/')[1] },

        "Fee":              function(pSource) { return pSource['FEE']; },
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

        "Date":     function(pSource) { return pSource["created at"]; },
        "Type":     function(pSource) { return pSource["side"].toUpperCase(); },
        "Exchange": function(pSource) { return "Coinbase Pro"; },
        "Base amount":   function(pSource) { return pSource["price"]; },
        "Base currency": function(pSource) { return pSource['product'].split('-')[0] },

        "Quote amount":     function(pSource) { return pSource['size'] },
        "Quote currency":   function(pSource) { return pSource['product'].split('-')[1] },

        "Fee":              function(pSource) { return pSource['fee']; },
        "Fee currency":     function(pSource) { return pSource['product'].split('-')[1] },

        "Costs/Proceeds":          function(pSource) { return pSource['total']; },
        "Costs/Proceeds currency": function(pSource) { return pSource['proce/fee/total unit']; },
        "Sync holdings":           function(pSource) { return ""; },
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
        "Base amount":   function(pSource) { return pSource["Total"]; },
        "Base currency": function(pSource) { return pSource['Market'].split('/')[1] },

        "Quote amount":     function(pSource) { return pSource['Amount'] },
        "Quote currency":   function(pSource) { return pSource['Market'].split('/')[0] },

        "Fee":              function(pSource) {
            var fee = pSource["Total"]*(pSource["Fee"].replace('%',"")/100);
            return fee;
        },
        "Fee currency":     function(pSource) { return pSource['Market'].split('/')[1]; },
        "Costs/Proceeds":          function(pSource) { return ""; },
        "Costs/Proceeds currency": function(pSource) { return ""; },
        "Sync holdings":           function(pSource) { return ""; },
        "Sent/Received from":      function(pSource) { return ""; },
        "Sent to":                 function(pSource) { return ""; },
        "Notes":                   function(pSource) { return ""; }
    }
};