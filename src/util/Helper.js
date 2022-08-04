/**
 *
 * @param {Array.<Vector>} points - Array of points.
 * @param {Vector} normal - The unit vector axis.
 * @param {Array.<number>} result - An array. result[0] is minimum value, result[1] is maximum value
 */
const flattenPointsOn = (points, normal, result) => {
  var min = Number.MAX_VALUE;
  var max = -Number.MAX_VALUE;

  var length = points.length;

  for (var i = 0; i < length; i++) {
    var dot = points[i].dot(normal);

    if (dot < min) min = dot;
    if (dot > max) max = dot;
  }

  result[0] = min;
  result[1] = max;
}


/**
 * @param {Vector} line The line segment.
 * @param {Vector} point The point.
 * @return  {number} LEFT_VORONOI_REGION (-1) if it is the left region,
 *          MIDDLE_VORONOI_REGION (0) if it is the middle region,
 *          RIGHT_VORONOI_REGION (1) if it is the right region.
*/
const voronoiRegion = (line, point) => {
  var len2 = line.len2();
  var dp = point.dot(line);

  /**
   * @const
   */
  var LEFT_VORONOI_REGION = -1;
  /**
   * @const
   */
  var MIDDLE_VORONOI_REGION = 0;
  /**
   * @const
   */
  var RIGHT_VORONOI_REGION = 1;

  if (dp < 0) { return LEFT_VORONOI_REGION; }
  else if (dp > len2) { return RIGHT_VORONOI_REGION; }
  else { return MIDDLE_VORONOI_REGION; }
}

export {flattenPointsOn, voronoiRegion};