/**
 * NodeController
 *
 * @description :: Server-side logic for managing nodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');

module.exports = {
	findByTagExpression: function (req, res) {
    var tagShouldMatchList = [];
    var tagShouldNotMatchList = [];

    if (!req.query.e) {
      Node.find()
      .exec(function (err, nodeList) {
        res.json(nodeList);
      })

      return;
    }

    // + 会在客户端传来的时候转义为空格
    // 以 'a+b-c-d+e+f-g+h' 为例
    _.each(req.query.e.split(' '), function (tagShouldMatch) {
      // tagNest 将会为 [a] [b,c,d] [e] [f,g] [h]
      var tagNest = tagShouldMatch.split('-');

      if (tagNest.length === 1) {
        // push 了 a e h
        tagShouldMatchList.push(tagNest[0])
      } else {
        // push 了 b f
        tagShouldMatchList.push(tagNest[0]);

        _.each(tagNest, function (tag, i) {
          if (i > 0) {
            // push 了 c d g
            tagShouldNotMatchList.push(tag);
          }
        });
      }
    })

    tagShouldMatchList = _.compact(tagShouldMatchList);
    tagShouldNotMatchList = _.compact(tagShouldNotMatchList);

    console.log(tagShouldMatchList)
    console.log(tagShouldNotMatchList)

    Node.find()
    .exec(function (err, nodeList) {
      var nodeListFiltered = _.filter(nodeList, function (node) {
        var shouldNodeFiltered = false;

        // 每一个在 tagShouldMatchList 里的 tag 都必须在 node 里
        _.each(tagShouldMatchList, function (tagInShouldMatchList) {
          shouldNodeFiltered = false;
          _.each(node.tag, function (tagInNode) {
            if (tagInNode === tagInShouldMatchList) {
              shouldNodeFiltered = true;
            }
          });
        })

        // node 里只要有一个 tagShouldNotMatchList 的就否决
        _.each(node.tag, function (tagInNode) {
          _.each(tagShouldNotMatchList, function (tagInShouldNotMatchList) {
            if (tagInNode === tagInShouldNotMatchList) {
              shouldNodeFiltered = false;
            }
          })
        });

        return shouldNodeFiltered;
      });
      res.json(nodeListFiltered);
    });
  }
};

