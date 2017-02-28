import urllib2
from bs4 import BeautifulSoup  
import xlwt

site = 'http://www.basketball-reference.com/players/m/mingya01.html'
request=urllib2.Request(site)
request.add_header('User-Agent',"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
html = urllib2.urlopen(request).read()
soup = BeautifulSoup(html, "lxml")

workbook = xlwt.Workbook()
sheet = workbook.add_sheet('per_game', cell_overwrite_ok=True)

soup_per_game = soup.find(id='per_game')
index_y=0
for i in soup_per_game.find_all('thead'):
    index_x=0
    for j in i.find_all('th'):
        sheet.write(index_y, index_x, j.get_text())
        index_x+=1

index_y+=1
for j in soup_per_game.find_all(class_="full_table"):
    index_x=0
    season=j.find('th').find('a').get_text()
    sheet.write(index_y, index_x, season)
    index_x+=1
    
    for i in j.find_all("td"):
        sheet.write(index_y, index_x, i.get_text())
        index_x+=1
    index_y+=1
    
workbook.save('./yaoming.xls')
