queue()
    .defer(d3.json, 'data/hrDataset.json')
    .await(graphCreation);


function graphCreation(error, hrDataset) {
    var ndx = crossfilter(hrDataset);

    maleFemale_Ratio(ndx);
    maleFemalePay_Ratio(ndx);

    dc.renderAll();
}


function maleFemale_Ratio(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(['Female', 'Male'])
        .range(['Orchid', 'SpringGreen']);

    var dim = ndx.dimension(dc.pluck('Sex'))
    var group = dim.group();

    dc.barChart("#maleFemaleBarChart")
        .width(350)
        .height(350)
        .margins({ top: 10, right: 50, bottom: 50, left: 50 })
        .dimension(dim)
        .group(group)
        .transitionDuration(1500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
        .yAxis().ticks(10);
}

function maleFemalePay_Ratio(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(['Female', 'Male'])
        .range(['Orchid', 'SpringGreen']);

    var dim = ndx.dimension(dc.pluck('Sex'))
    var group = dim.group();
    var payRatio = dim.group().reduceSum(dc.pluck('PayRate'));

    dc.pieChart('#maleFemalePayBarChart')
        .height(350)
        .radius(200)
        .transitionDuration(1500)
        .dimension(dim)
        .group(payRatio)
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
}
