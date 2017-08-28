var TURN__LEFT =  1;
var TURN_RIGHT = -1;
var TURN_NONE  =  0;

/**
 * 使用JarvisMatch函数进行给定的点坐标集合的凸包计算操作，函数返回所有的最外层的凸包点的坐标的集合
 * 
 * @param points 参数为一个点对象数组，元素的数据结构为``var point = {x:0, y:0};``
 * @return 函数返回凸包的顶点坐标的集合
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

/**
 * 函数计算求取所给定的两个点坐标之间的距离值
 * 
 * @param p 点坐标p
 * @param q 点坐标q
 * 
 * @return 函数返回两个点之间的距离值
 */
function dist(p, q) {
	var dx = q.x - p.x;
    var dy = q.y - p.y;
    return dx * dx + dy * dy;
}

function turn(p, q, r) {
	var a = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
	return compareTo(a, 0);
}

/**
 * 函数比较两个数的大小
 * 
 * @param a 实数a
 * @param b 实数b
 * 
 * @return 两个数相等则返回零，a小于b的时候返回-1，a大于b的时候返回1
 */
function compareTo(a, b) {
    if(a == b) {
        return 0;            
    } else if (a < b) {
		return -1;
	} else {
		return 1;
	}
}