# Preprocessing

We need to split dataset in several parts in order to give each replica one of them.

Run `./src/preprocess/index.js` in order to split dataset.

You will need two env variable set:

`PRE_DATASET_PATH` - path to dataset
`PRE_OUT_DIR` - path to output dir
`PRE_PARTITIONING_FACTOR` - number of files to split dataset to.

Dataset is taken [from](https://www.kaggle.com/gyani95/380000-lyrics-from-metrolyrics)
