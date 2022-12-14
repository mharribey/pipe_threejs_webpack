/**
 * Used to delay for a certain time
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
const Delay = (milliseconds) => {
 return new Promise((resolve) => {
  setTimeout(() => {
   resolve();
  }, milliseconds);
 });
};

export default Delay;

// import  Delay  from '@/utils/delay'
// function hello() {
//   Delay(500)
//   console.log('hello')
// }
