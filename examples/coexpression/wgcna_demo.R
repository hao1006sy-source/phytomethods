args <- commandArgs(trailingOnly=TRUE)
if (length(args)!=1) stop('Usage: Rscript wgcna_demo.R NEW_OUTPUT_DIR')
out <- args[[1]]
if (dir.exists(out) || file.exists(out)) stop('Output already exists; choose a new directory')
dir.create(out, recursive=TRUE)
suppressPackageStartupMessages(library(WGCNA))
set.seed(20261121)
n <- 36; p <- 60
latent_a <- rnorm(n); latent_b <- rnorm(n)
expr <- matrix(rnorm(n*p, sd=0.35), nrow=n, ncol=p)
expr[,1:25] <- expr[,1:25] + latent_a
expr[,26:50] <- expr[,26:50] + latent_b
rownames(expr) <- sprintf('sample_%02d',seq_len(n));colnames(expr) <- sprintf('gene_%02d',seq_len(p))
write.table(expr,file.path(out,'synthetic_expression.tsv'),sep='\t',quote=FALSE,col.names=NA)
network <- blockwiseModules(expr, power=6, networkType='signed', TOMType='signed',
  minModuleSize=10, mergeCutHeight=0.25, numericLabels=TRUE,
  pamRespectsDendro=FALSE, randomSeed=20261121, nThreads=1, verbose=0)
colors <- labels2colors(network$colors)
write.csv(data.frame(gene=colnames(expr),module=colors),file.path(out,'modules.csv'),row.names=FALSE)
write.csv(data.frame(sample=rownames(expr),network$MEs),file.path(out,'module_eigengenes.csv'),row.names=FALSE)
correlation <- cor(expr)
write.csv(correlation,file.path(out,'gene_correlations.csv'))
order_idx <- order(colors,seq_along(colors))
png(file.path(out,'correlation-heatmap.png'),width=1100,height=1000,res=150)
par(mar=c(4,4,4,7))
image(seq_len(p),seq_len(p),correlation[order_idx,rev(order_idx)],col=colorRampPalette(c('#bd783f','#ffffff','#197b73'))(101),zlim=c(-1,1),axes=FALSE,xlab='Genes ordered by module',ylab='Genes ordered by module',main='Synthetic expression: Pearson correlation')
box();legend('topright',inset=c(-0.27,0),legend=c('+1','0','-1'),fill=c('#197b73','#ffffff','#bd783f'),xpd=TRUE,bty='n');dev.off()
sink(file.path(out,'run.txt'))
cat('Data: synthetic continuous expression, not real plant measurements\n')
cat('Seed: 20261121; samples:',n,'; genes:',p,'\n')
cat('Method: WGCNA signed network; power 6; minModuleSize 10; mergeCutHeight 0.25\n')
cat('Module counts:\n');print(table(colors));cat('\n');sessionInfo()
sink()
cat('WGCNA synthetic workflow complete.\n');print(table(colors))
