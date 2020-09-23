const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');
const Log = require('../lib/models/log');


describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a recipe', () => {
    return request(app)
      .post('/api/v1/recipes')
      .send({
        name: 'cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ]
        });
      });
  });

  it('gets a single recipe', async () => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get('/api/v1/recipes/1')
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'cookies',
          directions: []
        });
      });
  });

  it('gets all recipes', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toContainEqual(recipe);
        });
      });
  });

  it('updates a recipe by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    return request(app)
      .put(`/api/v1/recipes/${recipe.id}`)
      .send({
        name: 'good cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'good cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ]
        });
      });
  });

  it('deletes a recipe', async() => {
    const thisRecipe = await Recipe.insert({
      name: 'good cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ]
    });

    const response = await request(app)
      .delete(`/api/v1/recipes/${thisRecipe.id}`);

    expect(response.body).toEqual({
      id: thisRecipe.id,
      name: 'good cookies', 
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ]
    });
  });

  //log tests -- should I be putting these in two separate test files? 
  it('creates a log', async() => {
    const recipe = await Recipe.insert({
      name: 'cake',
      directions: [
        'take the mix',
        'put it in a bowl',
        'do a dance',
        'you know the rest'
      ]
    });

    return request(app)
      .post('/api/v1/logs')
      .send({
        recipeId: recipe.id,
        dateOfEvent: '08-08-88',
        notes: 'yas cake',
        rating: 10
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: recipe.id,
          dateOfEvent: '08-08-88',
          notes: 'yas cake',
          rating: 10
        });
      });
  });


  it('gets all logs', async() => {
    const recipe = await Recipe.insert({
      name: 'cake',
      directions: [
        'take the mix',
        'put it in a bowl',
        'do a dance',
        'you know the rest'
      ]
    });

    await Promise.all([
      { 
        recipeId: recipe.id,
        dateOfEvent: '08-08-88',
        notes: 'yas cake',
        rating: 10 
      },
      { 
        recipeId: recipe.id,
        dateOfEvent: '08-08-87',
        notes: 'love this',
        rating: 1000 
      }
    ].map(log => Log.insert(log)));

    return request(app)
      .get('/api/v1/logs')
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([
          {
            id: expect.any(String),
            recipeId: recipe.id,
            dateOfEvent: '08-08-88',
            notes: 'yas cake',
            rating: 10
          },
          {
            id: expect.any(String),
            recipeId: recipe.id,
            dateOfEvent: '08-08-87',
            notes: 'love this',
            rating: 1000  
          }]));
      });
  });

  it('gets a log by id', async() => {
    const recipe = await Recipe.insert({
      name: 'unicorn cake',
      directions: [
        'chop up a unicorn',
        'bake it in a cake'
      ]
    });

    const log = await Log.insert({
      recipeId: recipe.id,
      dateOfEvent: '08-08-88',
      notes: 'magical',
      rating: 3 
    });

    return request(app)
      .get(`/api/v1/logs/${log.id}`)
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: recipe.id,
          dateOfEvent: '08-08-88',
          notes: 'magical',
          rating: 3
        });
      });
  });

  it('updates a log by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ]
    });

    const log = await Log.insert({
      recipeId: recipe.id,
      dateOfEvent: '86-75-3099',
      notes: 'here is another note',
      rating: 8 
    });

    return request(app)
      .put(`/api/v1/logs/${log.id}`)
      .send({
        recipeId: recipe.id,
        dateOfEvent: '12-34-5678',
        notes: 'okay sure',
        rating: 7
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: recipe.id,
          dateOfEvent: '12-34-5678',
          notes: 'okay sure',
          rating: 7
        });
      });
  });

  it('deletes a recipe', async() => {
    const recipe = await Recipe.insert({
      name: 'booger',
      directions: [
        'pick yer nose',
        'that is it'
      ]
    });

    const log = await Log.insert({
      recipeId: recipe.id,
      dateOfEvent: '01-02-1234',
      notes: 'this is incredible',
      rating: 5000
    });

    return request(app)
      .delete(`/api/v1/logs/${log.id}`)
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: recipe.id,
          dateOfEvent: '01-02-1234',
          notes: 'this is incredible',
          rating: 5000
        });
      });
  });

});
