var DeltaOutput = "Date,Type,Exchange,Base amount,Base currency,Quote amount,Quote currency,Fee,Fee currency,Costs/Proceeds,Costs/Proceeds currency,Sync Holdings,Sent/Received from,Sent to,Notes".split(",");

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
        "_KnownCSVColumns": function(pSource) { return "Date(UTC),Market,Type,Price,Amount,Total,Fee,Fee Coin".split(","); },
        "Date":     function(pSource) { return pSource["Date(UTC)"]; },
        "Type":     function(pSource) { return pSource["Type"].toUpperCase(); },
        "Exchange": function(pSource) { return "Binance"; },
        "Base amount":   function(pSource) { return pSource["Amount"]; },
        "Base currency": function(pSource) {
            pos = pSource["Market"].indexOf(pSource["Fee Coin"]);
            // base currency is always last on binance pairs
            if(pos == 0) {
                a = pSource["Market"].substring(pSource["Fee Coin"].length );

            } else {
                a = pSource["Market"].substring(0,  pSource["Fee Coin"].length);
            }
            return a;
        },
        "Quote amount":     function(pSource) { return pSource['Total']; },
        "Quote currency":   function(pSource) { 
            pos = pSource["Market"].indexOf(pSource["Fee Coin"]);
            if(pos == 0) {
                a = pSource["Market"].substring(0, pSource["Fee Coin"].length );

            } else {
                a = pSource["Market"].substring(pos);
            }
            return a;
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
    }
};

(function( $ ){

    var methods = {
        init : function(options) {

        },

        // Attempt to detect the exchange
        detect : function ( pContent ) {
            var csvdata = $.csv.toObjects(pContent);

            for (var exchange in exchangeMapping) {
                var Matches = 0, NoMatch = 0;
                var Columns = exchangeMapping[exchange]._KnownCSVColumns();

                for(var KnownColumn in Columns) {
                    if(csvdata[0][Columns[KnownColumn]] !== undefined)
                        ++Matches
                    else
                        ++NoMatch;
                }
                if(Matches == Columns.length || Matches > NoMatch)
                    return exchange;
            }

            return false;
        },

        csvheader: function() {
            return DeltaOutput.join(",");
        },

        convert: function (pContent, pExchange) {
            var exchange = exchangeMapping[pExchange];

            if (typeof exchange['_RenameCSVColumns'] !== "undefined") {
                pContent = pContent.replace( exchange._KnownCSVColumns(), exchange._RenameCSVColumns() );
            }

            var csvdata = $.csv.toObjects(pContent);
            var results = [];

            for(var data in csvdata) {
                result = [];

                for(var Column in DeltaOutput) {

                    if( exchange[ DeltaOutput[Column] ] !== undefined) {
                        var convertedData = exchange[ DeltaOutput[Column] ]( csvdata[data] );

                        if(convertedData !== undefined)
                            result[Column] = convertedData;
                        else
                            result[Column] = "";
                    } else {
                        console.warn("Column " + DeltaOutput[Column] + " Not managed");
                    }
                }

                results.push(result.join(","));
            }
            return results.join('\n');
        }
    };

    $.fn.xcsv = function(methodOrOptions) {

        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));

        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {

            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.xcsv' );
        }    
    };


})( jQuery );
