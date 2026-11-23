import unittest,tempfile,importlib.machinery
from pathlib import Path
here=Path(__file__).resolve().parent
check=importlib.machinery.SourceFileLoader('inputs',str(here/'check-inputs.py')).load_module()
class InputChecks(unittest.TestCase):
 def verify(self,table,tree='(a:1,b:1);'):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d);(p/'tree').write_text(tree);(p/'table').write_text(table);return check.validate(p/'tree',p/'table')
 def test_valid(self):self.assertTrue(self.verify('Desc\tFamily ID\ta\tb\nx\t1\t1\t2\n')['valid'])
 def test_duplicate(self):
  with self.assertRaises(AssertionError):self.verify('Desc\tFamily ID\ta\tb\nx\t1\t1\t2\nx\t1\t2\t3\n')
 def test_negative(self):
  with self.assertRaises(AssertionError):self.verify('Desc\tFamily ID\ta\tb\nx\t1\t-1\t2\n')
 def test_species_mismatch(self):
  with self.assertRaises(AssertionError):self.verify('Desc\tFamily ID\ta\tc\nx\t1\t1\t2\n')
 def test_nonultrametric(self):
  with self.assertRaises(AssertionError):self.verify('Desc\tFamily ID\ta\tb\nx\t1\t1\t2\n','(a:1,b:2);')
if __name__=='__main__':unittest.main()
