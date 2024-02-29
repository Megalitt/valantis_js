const reset = document.querySelector('.reset')

reset.addEventListener('click', () => {
  localStorage.clear()
  localStorage.setItem('currentPage', 1)
  location.reload()
})

let filter = null
let pages = []
const API = 'https://api.valantis.store:41000/'
// const API = 'http://api.valantis.store:40000/'
const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // получаем дату без разделителей
const password = 'Valantis'
const token = md5(`${password}_${date}`)
const auth = { headers: {"X-Auth":  token}}
let loader = document.querySelector('.loader')
let navigate = document.querySelector('.navigation')

// получаем текущую страницу
let currentPage = localStorage.getItem('currentPage') === null
? 
(1, localStorage.setItem('currentPage', 1))
: 
+localStorage.getItem('currentPage')

// параметр филтрации выдачи
filter = localStorage.getItem('filter') === null
?
null
:
JSON.parse(localStorage.getItem('filter'))

const perPage = 50
const totalCount = 40000
const pagesCount = Math.ceil(totalCount/perPage)

const reset_filter = document.querySelector('.filter')
// сбрасываем фильтры
reset_filter.addEventListener('click', () => {
  localStorage.removeItem('filter')
  location.reload()
})
console.log(currentPage);
// запрос
async function  getPage(currentPage, perPage, filter) {
  currentPage = currentPage === 1 ? currentPage - 1 : (currentPage - 1)*50
  const action = filter === null ? "get_ids" : "filter"
  const params = filter === null ? {"offset": currentPage, "limit": perPage} :  filter

  loader.style.display = 'block' 
  navigate.style.display = 'none'
    try{
      await axios.post(API,
        {
          "action": action,
	        "params": params
        }, 
        auth
      ).then((response) => axios.post(API, 
        {
          "action": "get_items",
          "params": {"ids": response.data.result}
        }, 
        auth
      )).then((res) => {
        const arr = res.data.result.filter((obj, idx, arr) => 
        idx === arr.findIndex((t) => t.id === obj.id))// Удаляем дубликаты по id
        addTable(arr)
        loader.style.display = 'none'
        navigate.style.display = 'flex'
        if(filter !== null && items.length < 50){
          navigate.style.display = 'none'
        }
      })
      
    }catch (e){
      getPage(currentPage, perPage) // повторный запрос при ошибке
      console.log('Ошибка при загрузке идентификаторов')
    } 
}
getPage(currentPage, perPage, filter)

let tbody = document.querySelector('tbody');

//отрисовка таблицы
function addTable(items) {
  filter = {}
  for (let item of items) {
    let tr = document.createElement('tr');

    let td1 = document.createElement('td');
    td1.textContent = item.id;
    tr.appendChild(td1);

    let td2 = document.createElement('td');
    td2.textContent = item.product;
    td2.addEventListener('click', () => {
      filter["product"] = item.product
      localStorage.setItem('filter', JSON.stringify(filter))
      location.reload()
    })
    tr.appendChild(td2);

    let td3 = document.createElement('td');
    td3.textContent = item.price + ' ' + '₽';
    td3.addEventListener('click', () => {
      filter["price"] = item.price
      localStorage.setItem('filter', JSON.stringify(filter))
      location.reload()
    })
    tr.appendChild(td3);

    let td4 = document.createElement('td');
    td4.textContent = item.brand;
    td4.addEventListener('click', () => {
      if(item.brand){
        filter["brand"] = item.brand
        localStorage.setItem('filter', JSON.stringify(filter))
        location.reload()
      }
    })
    tr.appendChild(td4);
    tbody.appendChild(tr);
  }
  
}

// функция генерирующая номера страниц в панели навигации
function createPages(pages, pagesCount, currentPage){
  if(pagesCount > 5) {
    if(currentPage >= 5) {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i)
        if(i === pagesCount) break
      }
    }else{
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
        if(i === pagesCount) break
      }
    }
  }else{
    for (let i = 1; i <= pagesCount; i++) {
      pages.push(i)
    }
  }
}

createPages(pages, pagesCount, currentPage)

// переключение страниц вперед или переход к странице при клике
function clickeNext(n) {
  if(n === undefined){
    localStorage.setItem('currentPage', +localStorage.getItem('currentPage') + 1)
  }else{
    localStorage.setItem('currentPage', n )
  }
  location.reload()  
}

// переключение страниц назад
function clickeBack(n) {
  if(+localStorage.getItem('currentPage') === 1){
    return
  }else{
    localStorage.setItem('currentPage', +localStorage.getItem('currentPage') - 1)
    location.reload()
  }
}
let next = document.querySelector('.buttonNext')
let back = document.querySelector('.buttonBack')
// вперед
next.addEventListener('click', () => {
  clickeNext()
})
// назад
back.addEventListener('click', () => {
  clickeBack()
})

let nav = document.querySelector('.pagination')

// орисовка панели навигации
function navigation(){
  pages.map((el, i) => {
    let div = document.createElement('div')
    div.classList.add('item')
    if(currentPage === el) div.classList.add('activ_1')
    div.textContent = el
    nav.appendChild(div)
  })

}
navigation()

let items = document.querySelectorAll('.item')

// функция перехода на страницу
items.forEach((el) => {
  el.addEventListener('click', (e) => {
    items.forEach(item => item.classList.remove('activ_1'))
    if(currentPage === el) el.classList.add('activ_1');
    let n = +el.innerHTML
    clickeNext(n)
  })
})





