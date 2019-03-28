queue()
    .defer(d3.json, 'data/hrDataset.json')
    .await(graphCreation);


function graphCreation(error, hrDataset) {
    var ndx = crossfilter(hrDataset);

    gender_selector(ndx);
    maleFemale_Ratio(ndx);
    maleFemalePay_Ratio(ndx);
    maleFemaleJobtype_Ratio(ndx);

    dc.renderAll();
}

function gender_selector(ndx) {
    dim = ndx.dimension(dc.pluck('Sex'));
    group = dim.group()

    dc.selectMenu('#genderSelector')
        .dimension(dim)
        .group(group);
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

function maleFemaleJobtype_Ratio(ndx) {

    function RatioByGender(dimension, Department) {
        return dimension.group().reduce(
            function(p, v) {
                p.total++;
                if (v.Department == Department) {
                    p.match++;
                }
                return p;
            },
            function(p, v) {
                p.total--;
                if (v.Department == Department) {
                    p.match--;
                }
                return p;
            },
            function() {
                return { total: 0, match: 0 };
            }
        );
    }
    var dim = ndx.dimension(dc.pluck('Sex'));
    var JobRatioSales = RatioByGender(dim, "Sales");
    var JobRatioIT = RatioByGender(dim, "IT/IS");
    var JobRatioAdmin = RatioByGender(dim, "Admin Offices");
    var JobRatioSoftware = RatioByGender(dim, "Software Engineering");
    var JobRatioExecutive = RatioByGender(dim, "Executive Office");

    dc.barChart('#maleFemaleJobStackedBarChart')
        .width(400)
        .height(300)
        .dimension(dim)
        .group(JobRatioSales, 'Sales')
        .stack(JobRatioIT, 'IT/IS')
        .stack(JobRatioAdmin, 'Admin Offices')
        .stack(JobRatioSoftware, 'Software Engineering')
        .stack(JobRatioExecutive, 'Executive Office')
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            }
            else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 100, bottom: 30, left: 30 });
}
