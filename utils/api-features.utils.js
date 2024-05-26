const { Op } = require("sequelize");

const operatorMap = {
  gte: Op.gte,
  gt: Op.gt,
  lte: Op.lte,
  lt: Op.lt,
};

class APIFeatures {
  constructor(requestQuery) {
    this.requestQuery = requestQuery;
  }

  filter() {
    const queryObj = { ...this.requestQuery };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filter
    Object.keys(queryObj).forEach((key) => {
      if (typeof queryObj[key] === "object") {
        Object.keys(queryObj[key]).forEach((operator) => {
          queryObj[key][operatorMap[operator]] = queryObj[key][operator];
          delete queryObj[key][operator];
        });
      }
    });

    return queryObj;
  }

  sort() {
    const fieldsOrder = [];
    if (this.requestQuery.sort) {
      const sortQueries = this.requestQuery.sort.split(",");
      sortQueries.forEach((sortField) => {
        const [column, direction] = sortField.split("[");
        fieldsOrder.push([column, direction.replace("]", "")]);
      });
    } else {
      fieldsOrder.push(["createdAt", "DESC"]);
    }

    return fieldsOrder;
  }

  limitFields() {
    let selectedAttibutes = [];
    if (this.requestQuery.fields) {
      selectedAttibutes = this.requestQuery.fields.split(",");
    }

    return selectedAttibutes.length ? selectedAttibutes : null;
  }

  pagination() {
    const page = Number(this.requestQuery.page) || 1;
    const limit = Number(this.requestQuery.limit) || 10;
    const offset = (page - 1) * limit;

    return { limit, offset };
  }
}

module.exports = APIFeatures;
