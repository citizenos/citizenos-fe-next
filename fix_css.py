import re

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.scss'
with open(file_path, 'r') as f:
    content = f.read()

# I will find &.pro, &.con, &.poi inside .replies_wrap and add ::ng-deep to the inner classes
# Or simply change it so that the host root type is applied to replies_wrap, which I ALREADY DID!

