export const TEST_ACTION = 'test_action';

export function testAction(value){
  return{
    type: TEST_ACTION,
    payload: {data: value}
  }
}