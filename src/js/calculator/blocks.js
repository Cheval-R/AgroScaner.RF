export const mainPage = [
  `<table class="information__table gradation" data-table="first">
            <thead>
              <tr>
                <th colspan="4">Градация показателей</th>
              </tr>
              <tr>
                <th>Содержание</th>
                <th>Орг. в-во, %</th>
                <th>Фосфор, мг/кг</th>
                <th>Калий, ммоль+/кг</th>
              </tr>
            </thead>
            <tbody>
              <tr class="gradation__low">
                <td>Низкое</td>
                <td>&lt; 2,9</td>
                <td>&lt; 20</td>
                <td>&lt; 6</td>
              </tr>
              <tr class="gradation__optimal">
                <td>Оптимальное</td>
                <td>2,9&nbsp;— 6,2</td>
                <td>20&nbsp;— 40</td>
                <td>6&nbsp;— 12</td>
              </tr>
              <tr class="gradation__high">
                <td>Повышенное</td>
                <td>&gt; 6,2</td>
                <td>&gt; 40</td>
                <td>&gt; 12</td>
              </tr>
            </tbody>
          </table>`,
  , `<table id="input-table" class="information__table fertilizer" data-table="second">
            <thead>
              <tr>
                <th colspan="4">Элементы питания</th>
              </tr>
              <tr>
                <th>Элемент</th>
                <th>Сод-е, мг/кг</th>
                <th>Удобрение</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p>Азот</p>
                </td>
                <td>
                  <input id="n-value" type="number" min="0" value="0">
                </td>
                <td>
                  <select id="nitrogen">
                    <option>Нет</option>
                    <option>Аммиачная селитра</option>
                    <option>Сульфонитрат (30:7)</option>
                    <option>Сульфонитрат (26:13)</option>
                    <option>КАС(28)</option>
                    <option>Карбамид</option>
                    <option>Сульфат аммония</option>
                    <option>Безводный аммиак</option>
                  </select>
                </td>
                <td class="fertilizer__price">
                  <input id="nitrogen-price" type="number" min="0">
                </td>
              </tr>
              <tr>
                <td>
                  <p>Фосфор</p>
                </td>
                <td>
                  <input id="p-value" type="number" min="0" value="0">
                </td>
                <td>
                  <select id="phosphorus">
                    <option>Нет</option>
                    <option>Аммофос(52)</option>
                    <option>Аммофос(46)</option>
                    <option>Диаммофоска</option>
                    <option>Азофоска(15)</option>
                    <option>Азофоска(16)</option>
                    <option>NPKS(4)</option>
                    <option>NPKS(8)</option>
                    <option>Фосмука</option>
                  </select>
                </td>
                <td class="fertilizer__price">
                  <input id="phosphorus-price" type="number" min="0">
                </td>
              </tr>
              <tr>
                <td>
                  <p>Калий</p>
                </td>
                <td>
                  <input id="k-value" type="number" min="0" value="0">
                </td>
                <td>
                  <select id="potassium">
                    <option>Нет</option>
                    <option>Калий хлористый</option>
                    <option>Калий сернокислый</option>
                  </select>
                </td>
                <td class="fertilizer__price">
                  <input id="potassium-price" type="number" min="0">
                </td>
              </tr>
            </tbody>
          </table>`,
  , `<table class="information__table field-info" data-table="third">
            <thead>
              <tr>
                <th>
                  Площадь поля, га
                </th>
                <th>
                  Культура
                </th>
                <th>
                  Планируемый урожай, т/га
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input id="field-area" type="number" min="0" value="0">
                </td>
                <td>
                  <select id="crop">
                    <option>Пшеница яровая</option>
                    <option>Пшеница озимая</option>
                    <option>Рожь озимая</option>
                    <option>Ячмень яровой</option>
                    <option>Овес</option>
                    <option>Кукуруза на зерно</option>
                    <option>Кукуруза на силос</option>
                    <option>Рапс яровой</option>
                    <option>Горчица</option>
                    <option>Соя</option>
                    <option>Картофель</option>
                    <option>Люцерна</option>
                    <option>Просо</option>
                    <option>Гречиха</option>
                    <option>Горох</option>
                    <option>Вика</option>
                    <option>Подсолнечник</option>
                    <option>Свёкла сахарная</option>
                    <option>Кормовая свекла</option>
                    <option>Пар</option>
                    <option>Турнепс</option>
                    <option>Кормовая морковь</option>
                    <option>Столовая свекла</option>
                    <option>Вика с овсом</option>
                    <option>Клевер с тимофеевкой</option>
                    <option>Эспарцет</option>
                    <option>Сераделла</option>
                    <option>Естественные пастбища</option>
                    <option>Клевер</option>
                    <option>Тимофеевка</option>
                    <option>Подсолнечник з/м</option>
                    <option>Горох с овсом з/м</option>
                    <option>Вика с овсом з/м</option>
                    <option>Рожь озимая з/м</option>
                    <option>Рапс з/м</option>
                    <option>Капуста белокочанная</option>
                    <option>Томаты</option>
                    <option>Огурцы</option>
                    <option>Лук</option>
                    <option>Лён</option>
                    <option>Плодовые и ягодные</option>
                    <option>Конопля</option>
                  </select>
                </td>
                <td>
                  <input id="harvest" type="number">
                </td>
              </tr>
            </tbody>
          </table>`
];

export const clientPage = [
  `<table class="information__table field-info" data-table="first">
            <thead>
              <tr>
                <th colspan="2">Параметры поля</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>№ поля</td>
                <td>
                  <select id="fields">
                  </select>
                </td>
              </tr>
              <tr>
                <td>Площадь поля</td>
                <td> <input id="field-area" type="number" min="0"></td>
              </tr>
              <tr>
                <td>Культура</td>
                <td>
                  <select id="crop">
                    <option>Пшеница яровая</option>
                    <option>Пшеница озимая</option>
                    <option>Рожь озимая</option>
                    <option>Ячмень яровой</option>
                    <option>Овес</option>
                    <option>Кукуруза на зерно</option>
                    <option>Кукуруза на силос</option>
                    <option>Рапс яровой</option>
                    <option>Горчица</option>
                    <option>Соя</option>
                    <option>Картофель</option>
                    <option>Люцерна</option>
                    <option>Просо</option>
                    <option>Гречиха</option>
                    <option>Горох</option>
                    <option>Вика</option>
                    <option>Подсолнечник</option>
                    <option>Свёкла сахарная</option>
                    <option>Кормовая свекла</option>
                    <option>Пар</option>
                    <option>Турнепс</option>
                    <option>Кормовая морковь</option>
                    <option>Столовая свекла</option>
                    <option>Вика с овсом</option>
                    <option>Клевер с тимофеевкой</option>
                    <option>Эспарцет</option>
                    <option>Сераделла</option>
                    <option>Естественные пастбища</option>
                    <option>Клевер</option>
                    <option>Тимофеевка</option>
                    <option>Подсолнечник з/м</option>
                    <option>Горох с овсом з/м</option>
                    <option>Вика с овсом з/м</option>
                    <option>Рожь озимая з/м</option>
                    <option>Рапс з/м</option>
                    <option>Капуста белокочанная</option>
                    <option>Томаты</option>
                    <option>Огурцы</option>
                    <option>Лук</option>
                    <option>Лён</option>
                    <option>Плодовые и ягодные</option>
                    <option>Конопля</option>
                  </select>
                </td>
              </tr>
              <td>Планируемый урожай</td>
              <td><input id="harvest" type="number" min="0"></td>
              </tr>
            </tbody>
          </table>`,
  , `<table class="information__table fertilizer" id="input-table"  data-table="second">
            <thead>
              <tr>
                <th colspan="4">Выбор удобрений</th>
              </tr>
              <tr>
                <th>Тип</th>
                <th>Удобрение</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p>Азотное</p>
                </td>
                <td>
                  <select id="nitrogen">
                    <option value="" disabled selected hidden></option>
                    <option>Нет</option>
                    <option>Аммиачная селитра</option>
                    <option>Сульфонитрат (30:7)</option>
                    <option>Сульфонитрат (26:13)</option>
                    <option>КАС(28)</option>
                    <option>Карбамид</option>
                    <option>Сульфат аммония</option>
                    <option>Безводный аммиак</option>
                  </select>
                </td>
                <td class="fertilizer__price">
                  <input id="nitrogen-price" type="number" min="0">
                </td>
              </tr>
              <tr>
                <td>
                  <p>Фосфорное</p>
                </td>
                <td>
                  <select id="phosphorus">
                    <option value="" disabled selected hidden></option>
                    <option>Нет</option>
                    <option>Аммофос(52)</option>
                    <option>Аммофос(46)</option>
                    <option>Диаммофоска</option>
                    <option>Азофоска(15)</option>
                    <option>Азофоска(16)</option>
                    <option>NPKS(4)</option>
                    <option>NPKS(8)</option>
                    <option>Фосмука</option>
                  </select>
                </td>
                <td class="fertilizer__price">
                  <input id="phosphorus-price" type="number" min="0">
                </td>
              </tr>
              <tr>
                <td>
                  <p>Калийное</p>
                </td>
                <td>
                  <select id="potassium">
                    <option value="" disabled selected hidden></option>
                    <option>Нет</option>
                    <option>Калий хлористый</option>
                    <option>Калий сернокислый</option>
                  </select>
                </td>
                <td class="fertilizer__price">
                  <input id="potassium-price" type="number" min="0">
                </td>
              </tr>
            </tbody>
          </table>`
]












// export const mainPage = {
//   gradationTable: `<table class="information__table gradation" data-table="first">
//             <thead>
//               <tr>
//                 <th colspan="4">Градация показателей</th>
//               </tr>
//               <tr>
//                 <th>Содержание</th>
//                 <th>Орг. в-во, %</th>
//                 <th>Фосфор, мг/кг</th>
//                 <th>Калий, ммоль+/кг</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr class="gradation__low">
//                 <td>Низкое</td>
//                 <td>&lt; 2,9</td>
//                 <td>&lt; 20</td>
//                 <td>&lt; 6</td>
//               </tr>
//               <tr class="gradation__optimal">
//                 <td>Оптимальное</td>
//                 <td>2,9&nbsp;— 6,2</td>
//                 <td>20&nbsp;— 40</td>
//                 <td>6&nbsp;— 12</td>
//               </tr>
//               <tr class="gradation__high">
//                 <td>Повышенное</td>
//                 <td>&gt; 6,2</td>
//                 <td>&gt; 40</td>
//                 <td>&gt; 12</td>
//               </tr>
//             </tbody>
//           </table>`,
//   fertilizerTable: `<table id="input-table" class="information__table fertilizer" data-table="second">
//             <thead>
//               <tr>
//                 <th colspan="4">Элементы питания</th>
//               </tr>
//               <tr>
//                 <th>Элемент</th>
//                 <th>Сод-е, мг/кг</th>
//                 <th>Удобрение</th>
//                 <th>Стоимость</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>
//                   <p>Азот</p>
//                 </td>
//                 <td>
//                   <input id="n-value" type="number" min="0" value="0">
//                 </td>
//                 <td>
//                   <select id="nitrogen">
//                     <option>Нет</option>
//                     <option>Аммиачная селитра</option>
//                     <option>Сульфонитрат (30:7)</option>
//                     <option>Сульфонитрат (26:13)</option>
//                     <option>КАС(28)</option>
//                     <option>Карбамид</option>
//                     <option>Сульфат аммония</option>
//                     <option>Безводный аммиак</option>
//                   </select>
//                 </td>
//                 <td class="fertilizer__price">
//                   <input id="nitrogen-price" type="number" min="0">
//                 </td>
//               </tr>
//               <tr>
//                 <td>
//                   <p>Фосфор</p>
//                 </td>
//                 <td>
//                   <input id="p-value" type="number" min="0" value="0">
//                 </td>
//                 <td>
//                   <select id="phosphorus">
//                     <option>Нет</option>
//                     <option>Аммофос(52)</option>
//                     <option>Аммофос(46)</option>
//                     <option>Диаммофоска</option>
//                     <option>Азофоска(15)</option>
//                     <option>Азофоска(16)</option>
//                     <option>NPKS(4)</option>
//                     <option>NPKS(8)</option>
//                     <option>Фосмука</option>
//                   </select>
//                 </td>
//                 <td class="fertilizer__price">
//                   <input id="phosphorus-price" type="number" min="0">
//                 </td>
//               </tr>
//               <tr>
//                 <td>
//                   <p>Калий</p>
//                 </td>
//                 <td>
//                   <input id="k-value" type="number" min="0" value="0">
//                 </td>
//                 <td>
//                   <select id="potassium">
//                     <option>Нет</option>
//                     <option>Калий хлористый</option>
//                     <option>Калий сернокислый</option>
//                   </select>
//                 </td>
//                 <td class="fertilizer__price">
//                   <input id="potassium-price" type="number" min="0">
//                 </td>
//               </tr>
//             </tbody>
//           </table>`,
//   fieldInfoTable: `<table class="information__table field-info" data-table="third">
//             <thead>
//               <tr>
//                 <th>
//                   Площадь поля, га
//                 </th>
//                 <th>
//                   Культура
//                 </th>
//                 <th>
//                   Планируемый урожай, т/га
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>
//                   <input id="field-area" type="number" min="0" value="0">
//                 </td>
//                 <td>
//                   <select id="crop">
//                     <option>Пшеница яровая</option>
//                     <option>Пшеница озимая</option>
//                     <option>Рожь озимая</option>
//                     <option>Ячмень яровой</option>
//                     <option>Овес</option>
//                     <option>Кукуруза на зерно</option>
//                     <option>Кукуруза на силос</option>
//                     <option>Рапс яровой</option>
//                     <option>Горчица</option>
//                     <option>Соя</option>
//                     <option>Картофель</option>
//                     <option>Люцерна</option>
//                     <option>Просо</option>
//                     <option>Гречиха</option>
//                     <option>Горох</option>
//                     <option>Вика</option>
//                     <option>Подсолнечник</option>
//                     <option>Свёкла сахарная</option>
//                     <option>Кормовая свекла</option>
//                     <option>Пар</option>
//                     <option>Турнепс</option>
//                     <option>Кормовая морковь</option>
//                     <option>Столовая свекла</option>
//                     <option>Вика с овсом</option>
//                     <option>Клевер с тимофеевкой</option>
//                     <option>Эспарцет</option>
//                     <option>Сераделла</option>
//                     <option>Естественные пастбища</option>
//                     <option>Клевер</option>
//                     <option>Тимофеевка</option>
//                     <option>Подсолнечник з/м</option>
//                     <option>Горох с овсом з/м</option>
//                     <option>Вика с овсом з/м</option>
//                     <option>Рожь озимая з/м</option>
//                     <option>Рапс з/м</option>
//                     <option>Капуста белокочанная</option>
//                     <option>Томаты</option>
//                     <option>Огурцы</option>
//                     <option>Лук</option>
//                     <option>Лён</option>
//                     <option>Плодовые и ягодные</option>
//                     <option>Конопля</option>
//                   </select>
//                 </td>
//                 <td>
//                   <input id="harvest" type="number">
//                 </td>
//               </tr>
//             </tbody>
//           </table>`
// };
// export const clientPage = {
//   fieldInfoTable: `<table class="information__table field-info" data-table="first">
//             <thead>
//               <tr>
//                 <th colspan="2">Параметры поля</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>№ поля</td>
//                 <td>
//                   <select id="fields">
//                   </select>
//                 </td>
//               </tr>
//               <tr>
//                 <td>Площадь поля</td>
//                 <td> <input id="field-area" type="number" min="0"></td>
//               </tr>
//               <tr>
//                 <td>Культура</td>
//                 <td>
//                   <select id="crop">
//                     <option>Пшеница яровая</option>
//                     <option>Пшеница озимая</option>
//                     <option>Рожь озимая</option>
//                     <option>Ячмень яровой</option>
//                     <option>Овес</option>
//                     <option>Кукуруза на зерно</option>
//                     <option>Кукуруза на силос</option>
//                     <option>Рапс яровой</option>
//                     <option>Горчица</option>
//                     <option>Соя</option>
//                     <option>Картофель</option>
//                     <option>Люцерна</option>
//                     <option>Просо</option>
//                     <option>Гречиха</option>
//                     <option>Горох</option>
//                     <option>Вика</option>
//                     <option>Подсолнечник</option>
//                     <option>Свёкла сахарная</option>
//                     <option>Кормовая свекла</option>
//                     <option>Пар</option>
//                     <option>Турнепс</option>
//                     <option>Кормовая морковь</option>
//                     <option>Столовая свекла</option>
//                     <option>Вика с овсом</option>
//                     <option>Клевер с тимофеевкой</option>
//                     <option>Эспарцет</option>
//                     <option>Сераделла</option>
//                     <option>Естественные пастбища</option>
//                     <option>Клевер</option>
//                     <option>Тимофеевка</option>
//                     <option>Подсолнечник з/м</option>
//                     <option>Горох с овсом з/м</option>
//                     <option>Вика с овсом з/м</option>
//                     <option>Рожь озимая з/м</option>
//                     <option>Рапс з/м</option>
//                     <option>Капуста белокочанная</option>
//                     <option>Томаты</option>
//                     <option>Огурцы</option>
//                     <option>Лук</option>
//                     <option>Лён</option>
//                     <option>Плодовые и ягодные</option>
//                     <option>Конопля</option>
//                   </select>
//                 </td>
//               </tr>
//               <td>Планируемый урожай</td>
//               <td><input id="harvest" type="number" min="0"></td>
//               </tr>
//             </tbody>
//           </table>`,
//   fertilizerTable: `<table class="information__table fertilizer" id="input-table"  data-table="second">
//             <thead>
//               <tr>
//                 <th colspan="4">Выбор удобрений</th>
//               </tr>
//               <tr>
//                 <th>Тип</th>
//                 <th>Удобрение</th>
//                 <th>Стоимость</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>
//                   <p>Азотное</p>
//                 </td>
//                 <td>
//                   <select id="nitrogen">
//                     <option value="" disabled selected hidden></option>
//                     <option>Нет</option>
//                     <option>Аммиачная селитра</option>
//                     <option>Сульфонитрат (30:7)</option>
//                     <option>Сульфонитрат (26:13)</option>
//                     <option>КАС(28)</option>
//                     <option>Карбамид</option>
//                     <option>Сульфат аммония</option>
//                     <option>Безводный аммиак</option>
//                   </select>
//                 </td>
//                 <td class="fertilizer__price">
//                   <input id="nitrogen-price" type="number" min="0">
//                 </td>
//               </tr>
//               <tr>
//                 <td>
//                   <p>Фосфорное</p>
//                 </td>
//                 <td>
//                   <select id="phosphorus">
//                     <option value="" disabled selected hidden></option>
//                     <option>Нет</option>
//                     <option>Аммофос(52)</option>
//                     <option>Аммофос(46)</option>
//                     <option>Диаммофоска</option>
//                     <option>Азофоска(15)</option>
//                     <option>Азофоска(16)</option>
//                     <option>NPKS(4)</option>
//                     <option>NPKS(8)</option>
//                     <option>Фосмука</option>
//                   </select>
//                 </td>
//                 <td class="fertilizer__price">
//                   <input id="phosphorus-price" type="number" min="0">
//                 </td>
//               </tr>
//               <tr>
//                 <td>
//                   <p>Калийное</p>
//                 </td>
//                 <td>
//                   <select id="potassium">
//                     <option value="" disabled selected hidden></option>
//                     <option>Нет</option>
//                     <option>Калий хлористый</option>
//                     <option>Калий сернокислый</option>
//                   </select>
//                 </td>
//                 <td class="fertilizer__price">
//                   <input id="potassium-price" type="number" min="0">
//                 </td>
//               </tr>
//             </tbody>
//           </table>`
// }