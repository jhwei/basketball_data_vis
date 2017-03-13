
# coding: utf-8

# In[31]:

import json


# In[41]:

with open('kobe.json', 'r') as f:
    data = json.load(f)
kobe=json.loads(data)


# In[34]:

from bokeh.plotting import figure, output_file,curdoc
from bokeh.io import output_notebook,show
from bokeh.layouts import widgetbox,row,column
from bokeh.models.widgets import Button, RadioButtonGroup, Select, Slider,RadioGroup
from bokeh.colors import RGB
from bokeh.models import HoverTool,ColumnDataSource
from bokeh.embed import file_html


# In[57]:

shot_hover = HoverTool(tooltips=[("Shot Made:", "@made"),],names=['shot'])

line_hover = HoverTool(tooltips=[('Year:','@season'),('Num:','@y'),],names=['line'])

hex_item=ColumnDataSource(kobe['hex_item']['1996-97'])

prop=ColumnDataSource(dict(x=[i for i in range(1996,2015)],y=kobe['plus&minus'],season=kobe['season_list']))

point=ColumnDataSource(dict(x=[1996],y=[prop.data['y'][0]]))

def update_shot(attr,old,new):
    season=kobe['season_list'][int(year_slide.value)-1996]
    hex_item.data=(kobe['hex_item'][season])
    prop.data['y']=kobe[prop_select.value]
    point.data=dict(x=[int(year_slide.value)],y=[prop.data['y'][int(year_slide.value)-1996]])

prop_select = Select(title="Property", value="plus&minus", options=['plus&minus','%PTS','%FGA','min_ave','min_total'])
prop_select.on_change('value',update_shot)

year_slide=Slider(start=1996, end=2015, value=1996, step=1, title="Year")
year_slide.on_change('value',update_shot)

shot_type = RadioGroup(labels=["Every Shot", "Heat Map"], active=1)
control=widgetbox([shot_type,year_slide,prop_select])
#= RadioGroup(labels=["Every Shot", "Heat Map"], active=1)

p = figure(plot_width=900, plot_height=840,x_axis_location=None, y_axis_location=None,tools=[shot_hover])
p.background_fill_color = "#ffffff"
p.xgrid.grid_line_color = None
p.ygrid.grid_line_color = None
p.outline_line_color = "white"
# add a circle renderer with a size, color, and alpha
#plot.Circle(x=0, y=0, size=7.5, line_color="#3288Bd", fill_color="white", line_width=2)
p.circle(x=0,y=0,radius=7.5,line_width=2,fill_color="white",line_color='black',fill_alpha=0)

p.line(x=[-30,30], y=[-7.5,-7.5], line_width=2, color="black")

    # Create the outer box 0f the paint, width=16ft, height=19ft
p.rect(x=0,y= 47.5, width=160,height= 190, line_width=2, color="black",fill_alpha=0)
    # Create the inner box of the paint, widt=12ft, height=19ft
p.rect(x=0, y=47.5, width=120,height= 190, line_width=2, color="black",fill_alpha=0)

p.arc(x=0, y=142.5, radius=60, start_angle=0, end_angle=3.14,line_width=2, color="black")

p.arc(x=0, y=142.5, radius=60, start_angle=3.14, end_angle=0,line_width=2, color="black",line_dash="dashed")

    # Restricted Zone, it is an arc with 4ft radius from center of the hoop
p.arc(x=0, y=0, radius=40, start_angle=0, end_angle=3.14,line_width=2, color="black")

p.line(x=[-220,-220], y=[-47.5,85], line_width=2, color="black")

p.line(x=[220,220], y=[-47.5,85], line_width=2, color="black")

p.arc(x=0, y=0, radius=237.7,start_angle=23.0/180*3.14, end_angle=158.0/180*3.14,line_width=2, color="black")
               
    # Center Court
p.arc(x=0, y=422.5, radius=60, start_angle=3.14, end_angle=0,line_width=2, color="black")

p.arc(x=0, y=422.5, radius=20, start_angle=3.14, end_angle=0,line_width=2, color="black")

p.rect(x=0, y=187.5, width=500, height=470, line_width=2, color="black",fill_alpha=0)

p.patches(xs="x_loc",ys="y_loc",line_color="colors",fill_color="colors",source=hex_item,name="shot")

l = figure(plot_width=800, plot_height=500,tools=[line_hover],title='Property')

l.line('x','y',source=prop,line_width=2,name='line',line_color='grey')
l.circle('x','y',source=point,size=8)
right=column(control,l)
lay_out=row(p,right)

curdoc().add_root(lay_out)

output_file('test.html')
show(lay_out)

