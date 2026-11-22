import numpy as np
x=np.array([[0,0,0],[0,0,1],[2,2,2],[2,2,1]],dtype=float)
u,s,v=np.linalg.svd(x-x.mean(axis=0),full_matrices=False)
projection=u[:,:2]*s[:2]
# PCA component signs are arbitrary, so compare pairwise distances.
expected=np.array([[-1.68343278,0.40749732],[-1.31438460,-0.52191295],[1.68343278,-0.40749732],[1.31438460,0.52191295]])
assert np.allclose(projection@projection.T,expected@expected.T,atol=1e-6)
assert np.allclose((s[:2]**2/(s**2).sum()),[.91231056,.08768944],atol=1e-6)
print('PCA 教学矩阵投影和解释比例通过数值检查')
