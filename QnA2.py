from bs4 import BeautifulSoup
#mport urllib
from urllib.request import urlopen,Request

site="https://zh.wikipedia.org/wiki/Aldi"
hdr = {'User-Agent': 'Mozilla/5.0'}
req = Request(site,headers=hdr)
page = urlopen(req)
soup = BeautifulSoup(page.read())
table = soup.find('table', class_='infobox vcard')
result = {}
exceptional_row_count = 0

for tr in table.find_all('tr'):
 if tr.find('th'):
     result[tr.find('th').text] = tr.find('td').text
 else:
     # the first row Logos fall here
     exceptional_row_count += 1

if exceptional_row_count> 1:
    print ('WARNING ExceptionalRow>1: ', table)

print(result)