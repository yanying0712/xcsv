var DeltaOutput = "Date,Type,Exchange,Base amount,Base currency,Quote amount,Quote currency,Fee,Fee currency,Costs/Proceeds,Costs/Proceeds currency,Sync Holdings,Sent/Received from,Sent to,Notes".split(",");

var exchangeData = {};

(function( $ ){

    var methods = {
        init : function(options) {

            for (var exchange in exchangeMapping) {

                if(exchange == "Binance") {
                    exchangeData[exchange] = {};

                    exchangeData[exchange].symbols = [];

                    for(var symbol in binanceData.symbols) {
                        if(!exchangeData[exchange].symbols.includes(binanceData.symbols[symbol].quoteAsset))
                            exchangeData[exchange].symbols.push(binanceData.symbols[symbol].quoteAsset);
                    }
                }

            }

        },

        // Attempt to detect the exchange
        detect : function ( pContent ) {
            var csvdata = $.csv.toObjects(pContent);
            // for Coinbase
            var pContent_Coinbase = ((pContent.split('\n')).splice(3)).join('\n');

            var csvdata_Coinbase = $.csv.toObjects(pContent_Coinbase);

            for (var exchange in exchangeMapping) {
                var Matches = 0, NoMatch = 0;
                var Columns = exchangeMapping[exchange]._KnownCSVColumns();

                for(var KnownColumn in Columns) {
                    if(csvdata[0][Columns[KnownColumn]] !== undefined || csvdata_Coinbase[0][Columns[KnownColumn]] !== undefined)
                        ++Matches;
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

            var csvdata = undefined;

            if(pExchange === 'Coinbase'){
                // for Coinbase
                var pContent_Coinbase = ((pContent.split('\n')).splice(3)).join('\n');

                csvdata= $.csv.toObjects(pContent_Coinbase);
                csvdata.map(item => {
                    item["Notes"] = item["Notes"].replace('\n\n',' ');
                    item["Notes"] = item["Notes"].replace(',', ' ');
                });

            }else{
                csvdata = $.csv.toObjects(pContent);
            }

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

    // Sort the list of exchanges by name
    const ordered = {};
    Object.keys(exchangeMapping).sort().forEach(function(key) {
      ordered[key] = exchangeMapping[key];
    });

    exchangeMapping = ordered;
})( jQuery );
