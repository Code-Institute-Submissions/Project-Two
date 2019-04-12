queue()
    .defer(d3.json, 'data/hrDataset.json')
    .await(graphCreation);


function graphCreation(error, hrDataset) {
    var ndx = crossfilter(hrDataset);

    gender_selector(ndx);
    department_selector(ndx);
    race_selector(ndx);
    maleFemale_Ratio(ndx);
    maleFemalePay_Ratio(ndx);
    EmploymentStatus_Ratio(ndx);
    maleFemaleJobtype_Ratio(ndx);
    maleFemaleMarital_Ratio(ndx);
    age_pay_ratio(ndx);

    dc.renderAll();
}

// dimension selectors

function gender_selector(ndx) {
    dim = ndx.dimension(dc.pluck('Sex'));
    group = dim.group()

    dc.selectMenu('#genderSelector')
        .dimension(dim)
        .group(group);
}

function department_selector(ndx) {
    dim = ndx.dimension(dc.pluck('Department'));
    group = dim.group()

    dc.selectMenu('#departmentSelector')
        .dimension(dim)
        .group(group);
}

function race_selector(ndx) {
    dim = ndx.dimension(dc.pluck('RaceDesc'));
    group = dim.group()

    dc.selectMenu('#raceSelector')
        .dimension(dim)
        .group(group);
}

// dc bar charts

//gender bar chart
function maleFemale_Ratio(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(['Female', 'Male'])
        .range(['#9467BD', '#1F77B4']);

    var dim = ndx.dimension(dc.pluck('Sex'))
    var group = dim.group();

    dc.barChart("#genderRatio")
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 20, left: 50 })
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

// gender pay ratio pie chart
function maleFemalePay_Ratio(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(['Female', 'Male'])
        .range(['#9467BD', '#1F77B4']);

    var dim = ndx.dimension(dc.pluck('Sex'))
    var group = dim.group();
    var payRatio = dim.group().reduceSum(dc.pluck('PayRate'));

    dc.pieChart('#genderPayRatio')
        .height(300)
        .radius(134)
        .transitionDuration(1500)
        .dimension(dim)
        .group(payRatio)
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
}

// employment status pie chart
function EmploymentStatus_Ratio(ndx) {
    var dim = ndx.dimension(dc.pluck('Employment Status'))
    var group = dim.group();

    dc.pieChart('#employmentRatio')
        .height(300)
        .radius(134)
        .transitionDuration(1500)
        .dimension(dim)
        .group(group);
}

//gender job type ratio stacked bar chart
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

    dc.barChart('#genderJobRatio')
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
        .legend(dc.legend().x(300).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 140, bottom: 30, left: 30 });
}

//marital status ratio stacked bar chart
function maleFemaleMarital_Ratio(ndx) {

    function RatioByStatus(dimension, MaritalDesc) {
        return dimension.group().reduce(
            function(p, v) {
                p.total++;
                if (v.MaritalDesc == MaritalDesc) {
                    p.match++;
                }
                return p;
            },
            function(p, v) {
                p.total--;
                if (v.MaritalDesc == MaritalDesc) {
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
    var MarrigeRatioMarried = RatioByStatus(dim, "Married");
    var MarrigeRatioDivorced = RatioByStatus(dim, "Divorced");
    var MarrigeRatioSeparated = RatioByStatus(dim, "Separated");
    var MarrigeRatioSingle = RatioByStatus(dim, "Single");
    var MarrigeRatioWidowed = RatioByStatus(dim, "widowed");


    dc.barChart('#maritalRatio')
        .width(400)
        .height(300)
        .dimension(dim)
        .group(MarrigeRatioMarried, 'Married')
        .stack(MarrigeRatioDivorced, 'Divorced')
        .stack(MarrigeRatioSeparated, 'Separated')
        .stack(MarrigeRatioSingle, 'Single')
        .stack(MarrigeRatioWidowed, 'widowed')
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
        .legend(dc.legend().x(300).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 140, bottom: 30, left: 30 });
}

// gender age to pay ratio scatter graph
function age_pay_ratio(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(['Female', 'Male'])
        .range(['#9467BD', '#1F77B4']);

    var AgeDim = ndx.dimension(dc.pluck('Age'));
    var payDim = ndx.dimension(function(d) {
        return [d.Age, d.PayRate, d.Sex];
    });
    var AgeToPayGroup = payDim.group();

    var minAge = AgeDim.bottom(1)[0].Age;
    var maxAge = AgeDim.top(1)[0].Age;

    dc.scatterPlot('#ageToPayRatio')
        .width(650)
        .height(350)
        .x(d3.scale.linear().domain([minAge, maxAge]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel('Pay Hourly Rate')
        .xAxisLabel('Age')
        .title(function(d) {
            return 'earned' + d.key[1];
        })
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
        .dimension(payDim)
        .group(AgeToPayGroup)
        .margins({ top: 10, right: 10, bottom: 75, left: 75 });
}
