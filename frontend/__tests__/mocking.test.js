function Person(name, foods) {
  this.name = name;
  this.foods = foods;
}

Person.prototype.fetchFavFoods = function (){
  return new Promise(
    (resolve, reject) => {
      setTimeout(() => resolve(this.foods), 2000);
    } 
  )
} 
describe('mocking', () => {
  it ('mocks a reg fn', () => {
    const fetchDogs = jest.fn();
    fetchDogs('hi');
    expect(fetchDogs).toHaveBeenCalled();
    expect(fetchDogs).toHaveBeenCalledWith('hi');
  })

  it('can create a person', () => {
    const me = new  Person('wes', ['pizza', 'burga']);
    expect(me.name).toBe('wes');
  })

  it('can create a person', async () => {
    const me = new  Person('wes', ['pizza', 'burga']);
    // Mock the fav foods function
    me.fetchFavFoods = jest.fn().mockResolvedValue(
      ['sushi', 'pizza']
    )
    const favFoods = await me.fetchFavFoods();
    expect(favFoods).toHaveLength(2);
    expect(favFoods).toContain('pizza');
  })

})