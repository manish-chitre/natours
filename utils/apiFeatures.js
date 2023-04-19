class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };

    const excludedFields = ['sort', 'fields', 'page', 'limit'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gte | lte | lt | gt)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    //1. Query Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-_id');
    }

    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paging() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    console.log(`page : ${page}, limit : ${limit}, skip: ${skip}`);

    //page=2&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
