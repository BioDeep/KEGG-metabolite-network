var TURN__LEFT =  1;
var TURN_RIGHT = -1;
var TURN_NONE  =  0;

/**
 * @param points 参数为一个点对象数组，元素的数据结构为var point = {x:0, y:0};
 *
 * @return 函数返回凸包的顶点坐标的集合
 *
 */
function JarvisMatch(points) {
	var hull = [];

	points.forEach(function(p) {
		
		if (hull.length == 0) {
			hull.push(p);
		} else {
			
			if (hull[0].x > p.x) {
				hull[0] = p;
			} else if (hull[0].x == p.x) {
				if (hull[0].y > p.y) {
					hull[0] = p;
				}
			}
			
		}
		
	});
	
	var q;
	var counter = 0;
	
	while (counter < hull.length) {
		
		q = nextHullPoint(points, hull[counter]);
		
		if (!(q.x == hull[0].x && q.y == hull[0].y)) {
			hull.push(q);
		}
		
		counter += 1;
	}
	
	return hull;
}

function nextHullPoint(points, p) {
	var q = p;
	var t = 0;
	
	points.forEach(function(r) {
		t = turn(p, q, r);
		
		if (t == TURN_RIGHT || t == TURN_NONE && dist(p, r) > dist(p, q)) {
			q = r;
		}
	});
	
	return q;
}

function dist(p, q) {
	var dx = q.x - p.x;
    var dy = q.y - p.y;
    return dx * dx + dy * dy;
}

function turn(p, q, r) {
	var a = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
	return compareTo(a, 0);
}

function compareTo(a, b) {
    if(a == b) {
        return 0;            
    } else if (a < b) {
		return -1;
	} else {
		return 1;
	}
}